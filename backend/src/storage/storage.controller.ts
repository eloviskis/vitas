import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import {
  CreatePresignedUrlDto,
  PresignedUrlResponseDto,
  FileUploadConfirmDto,
} from './dto/storage.dto';
import { File } from './entities/file.entity';

// Mock guard - substituir pelo guard real de autenticação
@Injectable()
class JwtAuthGuard {
  canActivate() {
    return true;
  }
}

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Gerar URL assinada para upload' })
  @ApiResponse({
    status: 201,
    description: 'URL assinada criada com sucesso',
    type: PresignedUrlResponseDto,
  })
  async createPresignedUrl(
    @Request() req,
    @Body() dto: CreatePresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    const userId = req.user?.id || 'mock-user-id'; // Pegar do JWT real
    return this.storageService.createPresignedUploadUrl(userId, dto);
  }

  @Post('confirm/:fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar upload realizado' })
  @ApiParam({ name: 'fileId', description: 'ID do arquivo' })
  @ApiResponse({
    status: 200,
    description: 'Upload confirmado e processado',
    type: File,
  })
  async confirmUpload(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<File> {
    const userId = req.user?.id || 'mock-user-id';
    return this.storageService.confirmUpload(fileId, userId);
  }

  @Get('download/:fileId')
  @ApiOperation({ summary: 'Obter URL de download do arquivo' })
  @ApiParam({ name: 'fileId', description: 'ID do arquivo' })
  @ApiResponse({
    status: 200,
    description: 'URL de download',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async getDownloadUrl(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<{ url: string }> {
    const userId = req.user?.id || 'mock-user-id';
    const url = await this.storageService.getDownloadUrl(fileId, userId);
    return { url };
  }

  @Get('thumbnail/:fileId')
  @ApiOperation({ summary: 'Obter URL do thumbnail' })
  @ApiParam({ name: 'fileId', description: 'ID do arquivo' })
  @ApiResponse({
    status: 200,
    description: 'URL do thumbnail',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async getThumbnailUrl(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<{ url: string }> {
    const userId = req.user?.id || 'mock-user-id';
    const url = await this.storageService.getThumbnailUrl(fileId, userId);
    return { url };
  }

  @Get('my-files')
  @ApiOperation({ summary: 'Listar meus arquivos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de arquivos do usuário',
    type: [File],
  })
  async listMyFiles(@Request() req): Promise<File[]> {
    const userId = req.user?.id || 'mock-user-id';
    return this.storageService.listUserFiles(userId);
  }

  @Get('case/:caseId/files')
  @ApiOperation({ summary: 'Listar arquivos de um caso' })
  @ApiParam({ name: 'caseId', description: 'ID do caso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de arquivos do caso',
    type: [File],
  })
  async listCaseFiles(
    @Request() req,
    @Param('caseId') caseId: string,
  ): Promise<File[]> {
    const userId = req.user?.id || 'mock-user-id';
    return this.storageService.listCaseFiles(caseId, userId);
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar arquivo (soft delete)' })
  @ApiParam({ name: 'fileId', description: 'ID do arquivo' })
  @ApiResponse({
    status: 204,
    description: 'Arquivo deletado com sucesso',
  })
  async deleteFile(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<void> {
    const userId = req.user?.id || 'mock-user-id';
    await this.storageService.deleteFile(fileId, userId);
  }
}
