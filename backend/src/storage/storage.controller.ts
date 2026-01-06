import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('Armazenamento')
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload de arquivo', description: 'Faz upload de foto, vídeo ou documento (max 10MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', description: 'Pasta destino (ex: chamados, documentos)' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Arquivo enviado com sucesso', schema: { example: { url: 'https://...', key: 'chamados/uuid.jpg' } } })
  @ApiResponse({ status: 400, description: 'Arquivo inválido (tamanho ou tipo)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large (max 10MB)');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const result = await this.storageService.uploadFile(file, folder || 'general');

    return {
      success: true,
      data: result,
    };
  }
}
