import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ChamadoHistoricoTipo } from '../entities/chamado-historico.entity';

export class CriarHistoricoDto {
  @ApiProperty({ enum: ChamadoHistoricoTipo })
  @IsEnum(ChamadoHistoricoTipo)
  tipo: ChamadoHistoricoTipo;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class HistoricoResponseDto {
  id: string;
  chamadoId: string;
  tipo: ChamadoHistoricoTipo;
  descricao?: string;
  metadata?: Record<string, any>;
  criadoEm: Date;
}

