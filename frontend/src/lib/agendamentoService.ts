import api from './api';

export interface Slot {
  inicio: Date;
  fim: Date;
  disponivel: boolean;
  profissionalId: string;
}

export interface CriarAgendamentoRequest {
  chamadoId: string;
  profissionalId: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  duracaoEstimadaMinutos: number;
  observacoes?: string;
}

export interface Agendamento {
  id: string;
  chamadoId: string;
  profissionalId: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  status: string;
  observacoes?: string;
}

const agendamentoService = {
  /**
   * Busca slots disponíveis de um profissional
   */
  async getSlotsDisponiveis(
    profissionalId: string,
    dataInicio: Date,
    dataFim: Date,
    duracao: number = 120
  ): Promise<Slot[]> {
    const response = await api.get('/agendamentos/slots', {
      params: {
        profissionalId,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        duracao,
      },
    });
    return response.data.map((slot: any) => ({
      ...slot,
      inicio: new Date(slot.inicio),
      fim: new Date(slot.fim),
    }));
  },

  /**
   * Cria um novo agendamento
   */
  async criarAgendamento(dados: CriarAgendamentoRequest): Promise<Agendamento> {
    const response = await api.post('/agendamentos', dados);
    return response.data;
  },

  /**
   * Confirma um agendamento (profissional)
   */
  async confirmarAgendamento(agendamentoId: string): Promise<Agendamento> {
    const response = await api.patch(`/agendamentos/${agendamentoId}/confirmar`);
    return response.data;
  },

  /**
   * Cancela um agendamento
   */
  async cancelarAgendamento(agendamentoId: string, motivo: string): Promise<Agendamento> {
    const response = await api.patch(`/agendamentos/${agendamentoId}/cancelar`, { motivo });
    return response.data;
  },

  /**
   * Reagenda um agendamento
   */
  async reagendarAgendamento(
    agendamentoId: string,
    novaDataInicio: Date,
    novaDataFim: Date
  ): Promise<Agendamento> {
    const response = await api.patch(`/agendamentos/${agendamentoId}/reagendar`, {
      novaDataInicio: novaDataInicio.toISOString(),
      novaDataFim: novaDataFim.toISOString(),
    });
    return response.data;
  },
};

export default agendamentoService;
