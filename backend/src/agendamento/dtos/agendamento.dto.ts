import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CriarAgendamentoDto {
  @IsString()
  chamadoId: string;

  @IsString()
  profissionalId: string;

  @IsDateString()
  dataHoraInicio: string;

  @IsDateString()
  dataHoraFim: string;

  @IsNumber()
  @Min(30)
  duracaoEstimadaMinutos: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class ConfirmarAgendamentoDto {
  @IsOptional()
  @IsString()
  observacoesProfissional?: string;
}

export class CancelarAgendamentoDto {
  @IsString()
  motivo: string;
}

export class ReagendarAgendamentoDto {
  @IsDateString()
  novaDataInicio: string;

  @IsDateString()
  novaDataFim: string;
}
