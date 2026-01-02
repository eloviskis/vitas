import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { SlotsService } from '../services/slots.service';
import { CriarAgendamentoDto, ConfirmarAgendamentoDto, CancelarAgendamentoDto, ReagendarAgendamentoDto } from '../dtos/agendamento.dto';

@Controller('agendamentos')
export class AgendamentoController {
  constructor(private readonly slotsService: SlotsService) {}

  /**
   * GET /agendamentos/slots
   * Retorna slots disponíveis de um profissional
   */
  @Get('slots')
  async getSlotsDisponiveis(
    @Query('profissionalId') profissionalId: string,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('duracao') duracao?: number
  ) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const duracaoServico = duracao ? parseInt(duracao.toString()) : 120;

    return await this.slotsService.getSlotsDisponiveis(
      profissionalId,
      inicio,
      fim,
      duracaoServico
    );
  }

  /**
   * POST /agendamentos
   * Cria um novo agendamento
   */
  @Post()
  async criarAgendamento(@Body() dados: CriarAgendamentoDto) {
    return await this.slotsService.criarAgendamento({
      chamadoId: dados.chamadoId,
      profissionalId: dados.profissionalId,
      dataHoraInicio: new Date(dados.dataHoraInicio),
      dataHoraFim: new Date(dados.dataHoraFim),
      duracaoEstimadaMinutos: dados.duracaoEstimadaMinutos,
      observacoes: dados.observacoes,
    });
  }

  /**
   * PATCH /agendamentos/:id/confirmar
   * Profissional confirma o agendamento
   */
  @Patch(':id/confirmar')
  async confirmarAgendamento(
    @Param('id') id: string,
    @Body() dados: ConfirmarAgendamentoDto
  ) {
    return await this.slotsService.confirmarAgendamento(id);
  }

  /**
   * PATCH /agendamentos/:id/cancelar
   * Cancela um agendamento
   */
  @Patch(':id/cancelar')
  async cancelarAgendamento(
    @Param('id') id: string,
    @Body() dados: CancelarAgendamentoDto
  ) {
    return await this.slotsService.cancelarAgendamento(id, dados.motivo);
  }

  /**
   * PATCH /agendamentos/:id/reagendar
   * Reagenda um agendamento
   */
  @Patch(':id/reagendar')
  async reagendarAgendamento(
    @Param('id') id: string,
    @Body() dados: ReagendarAgendamentoDto
  ) {
    return await this.slotsService.reagendarAgendamento(
      id,
      new Date(dados.novaDataInicio),
      new Date(dados.novaDataFim)
    );
  }
}
