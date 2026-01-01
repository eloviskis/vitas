import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileVisibility } from '../entities/file.entity';

export class CreatePresignedUrlDto {
  @ApiProperty({ description: 'Nome do arquivo original' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'MIME type do arquivo', example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Tamanho do arquivo em bytes' })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ description: 'ID do caso relacionado', type: 'string' })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Descrição do arquivo' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: FileVisibility,
    description: 'Visibilidade do arquivo',
    default: FileVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;
}

export class PresignedUrlResponseDto {
  @ApiProperty({ description: 'URL assinada para upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'ID do arquivo criado' })
  fileId: string;

  @ApiProperty({ description: 'Chave S3 do arquivo' })
  s3Key: string;

  @ApiProperty({ description: 'Campos para envio (se multipart)' })
  fields?: Record<string, string>;
}

export class FileUploadConfirmDto {
  @ApiProperty({ description: 'ID do arquivo' })
  @IsUUID()
  fileId: string;
}

export class GetFileDto {
  @ApiProperty({ description: 'ID do arquivo' })
  @IsUUID()
  fileId: string;
}

export class DeleteFileDto {
  @ApiProperty({ description: 'ID do arquivo a deletar' })
  @IsUUID()
  fileId: string;
}
