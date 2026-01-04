import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ChamadoStatus } from '../entities/chamado.entity';

export class CriarChamadoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  usuarioId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contexto: string; // Casa, Vida Digital, Familia, etc.

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AtualizarChamadoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(ChamadoStatus)
  status?: ChamadoStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class ChamadoResponseDto {
  id: string;
  usuarioId: string;
  contexto: string;
  descricao: string;
  status: ChamadoStatus;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
