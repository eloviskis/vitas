import api from './api';

export interface CriteriosTriagem {
  chamadoId?: string;
  especialidadeRequerida: string;
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  valorMaximoHora?: number;
  ratingMinimoRequired?: number;
  preferirAvaliados?: boolean;
  localizacao?: string;
}

export interface ProfissionalScore {
  id: string;
  nome: string;
  especialidade: string;
  rating: number;
  chamadosEmAndamento: number;
  valorHora: number;
  aceitaUrgentes: boolean;
  score: number;
  matchPercentual: number;
}

export interface ResultadoTriagem {
  chamadoId: string;
  triageType: 'AUTOMATICA' | 'ASSISTIDA';
  timestamp: Date;
  profissionaisOrdenados: ProfissionalScore[];
  profissionalRecomendado: ProfissionalScore;
  podeSerAutomatizado: boolean;
  justificativa: string;
}

const triagemService = {
  /**
   * Executa triagem automática de um chamado
   * @param chamadoId - ID do chamado a ser triado
   * @param criterios - Critérios para matching
   */
  async executarTriagem(
    chamadoId: string,
    criterios: CriteriosTriagem
  ): Promise<ResultadoTriagem> {
    const response = await api.post(`/chamados/${chamadoId}/triagem`, criterios);
    return response.data;
  },

  /**
   * Simula triagem com dados demo (útil para testes)
   * @param criterios - Critérios para matching
   */
  async simularTriagem(criterios: CriteriosTriagem): Promise<ResultadoTriagem> {
    const response = await api.post('/chamados/triagem/simular', criterios);
    return response.data;
  },

  /**
   * Re-executa triagem de um chamado (para reassignação)
   * @param chamadoId - ID do chamado
   * @param criterios - Novos critérios (opcional)
   */
  async retriage(chamadoId: string, criterios?: CriteriosTriagem): Promise<ResultadoTriagem> {
    const response = await api.post(`/chamados/${chamadoId}/retriage`, criterios || {});
    return response.data;
  },

  /**
   * Confirma seleção de profissional para um chamado
   * @param chamadoId - ID do chamado
   * @param profissionalId - ID do profissional selecionado
   */
  async confirmarSelecao(chamadoId: string, profissionalId: string): Promise<void> {
    await api.patch(`/chamados/${chamadoId}/profissional`, { profissionalId });
  },
};

export default triagemService;
