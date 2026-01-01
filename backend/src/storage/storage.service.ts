import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { File, FileType, FileVisibility } from './entities/file.entity';
import {
  CreatePresignedUrlDto,
  PresignedUrlResponseDto,
} from './dto/storage.dto';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {
    const region = this.configService.get('AWS_REGION');
    const endpoint = this.configService.get('AWS_S3_ENDPOINT');

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      ...(endpoint && {
        endpoint,
        forcePathStyle: true,
      }),
    });

    this.bucket = this.configService.get('AWS_S3_BUCKET_NAME');
    this.maxFileSize = parseInt(
      this.configService.get('MAX_FILE_SIZE') || '10485760',
    );
    this.allowedMimeTypes = (
      this.configService.get('ALLOWED_FILE_TYPES') || ''
    ).split(',');
  }

  /**
   * Valida se o tipo de arquivo é permitido
   */
  private validateMimeType(mimeType: string): void {
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido: ${mimeType}. Tipos aceitos: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Valida o tamanho do arquivo
   */
  private validateFileSize(size: number): void {
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Detecta o tipo de arquivo baseado no MIME type
   */
  private detectFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }
    if (
      mimeType === 'application/pdf' ||
      mimeType.includes('word') ||
      mimeType.includes('document')
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  /**
   * Gera nome único para arquivo no S3
   */
  private generateS3Key(
    userId: string,
    filename: string,
    fileType: FileType,
  ): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${fileType}s/${userId}/${timestamp}-${uniqueId}-${sanitizedFilename}`;
  }

  /**
   * Cria URL assinada para upload direto ao S3
   */
  async createPresignedUploadUrl(
    userId: string,
    dto: CreatePresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    this.logger.log(
      `Creating presigned URL for user ${userId}, file: ${dto.filename}`,
    );

    // Validações
    this.validateMimeType(dto.mimeType);
    if (dto.size) {
      this.validateFileSize(dto.size);
    }

    const fileType = this.detectFileType(dto.mimeType);
    const s3Key = this.generateS3Key(userId, dto.filename, fileType);

    // Criar registro no banco
    const file = this.fileRepository.create({
      originalName: dto.filename,
      filename: dto.filename,
      mimeType: dto.mimeType,
      size: dto.size || 0,
      type: fileType,
      visibility: dto.visibility || FileVisibility.PRIVATE,
      s3Key,
      s3Bucket: this.bucket,
      userId,
      caseId: dto.caseId,
      description: dto.description,
    });

    await this.fileRepository.save(file);

    // Gerar presigned URL
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: dto.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    }); // 1 hora

    this.logger.log(`Presigned URL created for file ID: ${file.id}`);

    return {
      uploadUrl,
      fileId: file.id,
      s3Key,
    };
  }

  /**
   * Confirma upload e processa arquivo (thumbnails, etc)
   */
  async confirmUpload(fileId: string, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    try {
      // Verificar se arquivo existe no S3
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: file.s3Key,
      });

      const headResult = await this.s3Client.send(headCommand);
      file.size = headResult.ContentLength || file.size;

      // Se for imagem, gerar thumbnail
      if (file.type === FileType.IMAGE) {
        await this.generateThumbnail(file);
      }

      await this.fileRepository.save(file);

      this.logger.log(`Upload confirmed for file ID: ${file.id}`);
      return file;
    } catch (error) {
      this.logger.error(`Error confirming upload: ${error.message}`);
      throw new BadRequestException('Arquivo não foi enviado ao S3');
    }
  }

  /**
   * Gera thumbnail para imagem
   */
  private async generateThumbnail(file: File): Promise<void> {
    try {
      // Download da imagem original
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: file.s3Key,
      });

      const response = await this.s3Client.send(getCommand);
      const imageBuffer = await this.streamToBuffer(response.Body);

      // Gerar thumbnail 300x300
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail
      const thumbnailKey = file.s3Key.replace(
        /(\.[^.]+)$/,
        '_thumb$1',
      );

      const putCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      });

      await this.s3Client.send(putCommand);

      file.thumbnailS3Key = thumbnailKey;
      this.logger.log(`Thumbnail generated for file: ${file.id}`);
    } catch (error) {
      this.logger.error(`Error generating thumbnail: ${error.message}`);
      // Não falhar o upload se thumbnail falhar
    }
  }

  /**
   * Converte stream para buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Obtém URL assinada para download
   */
  async getDownloadUrl(fileId: string, userId: string): Promise<string> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Verificar permissão (simplificado - expandir com ACL real)
    if (file.visibility === FileVisibility.PRIVATE && file.userId !== userId) {
      throw new BadRequestException('Sem permissão para acessar este arquivo');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.s3Key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return url;
  }

  /**
   * Obtém URL do thumbnail
   */
  async getThumbnailUrl(fileId: string, userId: string): Promise<string> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file || !file.thumbnailS3Key) {
      throw new NotFoundException('Thumbnail não encontrado');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.thumbnailS3Key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return url;
  }

  /**
   * Lista arquivos do usuário
   */
  async listUserFiles(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { userId, deleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lista arquivos de um caso
   */
  async listCaseFiles(caseId: string, userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { caseId, deleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Deleta arquivo (soft delete)
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Soft delete
    file.deleted = true;
    file.deletedAt = new Date();
    await this.fileRepository.save(file);

    this.logger.log(`File soft deleted: ${file.id}`);
  }

  /**
   * Remove permanentemente arquivo (hard delete - cron job)
   */
  async permanentlyDeleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      return;
    }

    try {
      // Deletar do S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.s3Key,
      });
      await this.s3Client.send(deleteCommand);

      // Deletar thumbnail se existir
      if (file.thumbnailS3Key) {
        const deleteThumbnailCommand = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file.thumbnailS3Key,
        });
        await this.s3Client.send(deleteThumbnailCommand);
      }

      // Deletar do banco
      await this.fileRepository.remove(file);

      this.logger.log(`File permanently deleted: ${fileId}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpar arquivos órfãos (deletados há mais de 30 dias)
   */
  async cleanupOrphanedFiles(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orphanedFiles = await this.fileRepository.find({
      where: {
        deleted: true,
      },
    });

    const filesToDelete = orphanedFiles.filter(
      (file) => file.deletedAt && file.deletedAt < thirtyDaysAgo,
    );

    for (const file of filesToDelete) {
      await this.permanentlyDeleteFile(file.id);
    }

    this.logger.log(`Cleaned up ${filesToDelete.length} orphaned files`);
    return filesToDelete.length;
  }
}
