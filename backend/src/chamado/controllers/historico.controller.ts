import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoricoService } from '../services/historico.service';
import { CriarHistoricoDto, HistoricoResponseDto } from '../dtos/historico.dto';
import { ChamadoHistorico } from '../entities/chamado-historico.entity';

@ApiTags('Chamados - Timeline')
@Controller('chamados/:chamadoId/historico')
export class HistoricoController {
  constructor(private readonly historicoService: HistoricoService) {}

  @Get()
  async listar(
    @Param('chamadoId') chamadoId: string,
  ): Promise<HistoricoResponseDto[]> {
    const eventos = await this.historicoService.listarPorChamado(chamadoId);
    return eventos.map((evt) => ({
      id: evt.id,
      chamadoId: evt.chamadoId,
      tipo: evt.tipo,
      descricao: evt.descricao,
      metadata: evt.metadata,
      criadoEm: evt.criadoEm,
    }));
  }

  @Post()
  async registrar(
    @Param('chamadoId') chamadoId: string,
    @Body() dto: CriarHistoricoDto,
  ): Promise<HistoricoResponseDto> {
    const evento = await this.historicoService.registrarEvento(chamadoId, dto);
    return {
      id: evento.id,
      chamadoId: evento.chamadoId,
      tipo: evento.tipo,
      descricao: evento.descricao,
      metadata: evento.metadata,
      criadoEm: evento.criadoEm,
    };
  }
}

