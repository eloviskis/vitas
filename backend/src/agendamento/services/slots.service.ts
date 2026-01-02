import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Agendamento, AgendamentoStatus } from '../entities/agendamento.entity';
import { Profissional } from '../../profissional/entities/profissional.entity';

export interface SlotDisponivel {
  inicio: Date;
  fim: Date;
  disponivel: boolean;
  profissionalId: string;
}

export interface ConfiguracaoAgenda {
  horarioInicio: string;      // "08:00"
  horarioFim: string;          // "18:00"
  intervaloMinutos: number;    // 30, 60, 120
  diasSemanaDisponiveis: number[];  // [1,2,3,4,5] = Seg-Sex
  duracaoMinimaMinutos: number;     // 60
  antecedenciaMinima: number;       // 24 horas
}

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Agendamento)
    private agendamentoRepository: Repository<Agendamento>,
    @InjectRepository(Profissional)
    private profissionalRepository: Repository<Profissional>,
  ) {}

  /**
   * Retorna slots disponíveis de um profissional em um período
   */
  async getSlotsDisponiveis(
    profissionalId: string,
    dataInicio: Date,
    dataFim: Date,
    duracaoServico: number = 120
  ): Promise<SlotDisponivel[]> {
    // Buscar configuração de agenda do profissional
    const config = this.getConfiguracao(profissionalId);

    // Gerar todos os slots possíveis no período
    const slotsGerados = this.gerarSlots(dataInicio, dataFim, config);

    // Buscar agendamentos existentes
    const agendamentosExistentes = await this.agendamentoRepository.find({
      where: {
        profissionalId,
        dataHoraInicio: Between(dataInicio, dataFim),
        status: Between(AgendamentoStatus.PENDENTE, AgendamentoStatus.EM_ANDAMENTO),
      },
    });

    // Marcar slots como indisponíveis se houver conflito
    const slotsDisponiveis = slotsGerados.map(slot => {
      const temConflito = agendamentosExistentes.some(agendamento => 
        this.verificarConflito(slot.inicio, slot.fim, agendamento.dataHoraInicio, agendamento.dataHoraFim)
      );

      return {
        ...slot,
        disponivel: !temConflito && this.verificarAntecedencia(slot.inicio, config.antecedenciaMinima),
      };
    });

    return slotsDisponiveis;
  }

  /**
   * Gera slots de tempo baseado na configuração
   */
  private gerarSlots(dataInicio: Date, dataFim: Date, config: ConfiguracaoAgenda): SlotDisponivel[] {
    const slots: SlotDisponivel[] = [];
    let currentDate = new Date(dataInicio);

    while (currentDate < dataFim) {
      const diaSemana = currentDate.getDay(); // 0 = Domingo, 6 = Sábado

      // Verifica se o dia está disponível
      if (config.diasSemanaDisponiveis.includes(diaSemana)) {
        const [horaInicio, minInicio] = config.horarioInicio.split(':').map(Number);
        const [horaFim, minFim] = config.horarioFim.split(':').map(Number);

        let slotInicio = new Date(currentDate);
        slotInicio.setHours(horaInicio, minInicio, 0, 0);

        const limiteHorario = new Date(currentDate);
        limiteHorario.setHours(horaFim, minFim, 0, 0);

        while (slotInicio < limiteHorario) {
          const slotFim = new Date(slotInicio);
          slotFim.setMinutes(slotInicio.getMinutes() + config.intervaloMinutos);

          if (slotFim <= limiteHorario) {
            slots.push({
              inicio: new Date(slotInicio),
              fim: new Date(slotFim),
              disponivel: true,
              profissionalId: '',
            });
          }

          slotInicio = slotFim;
        }
      }

      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return slots;
  }

  /**
   * Verifica se há conflito entre dois períodos
   */
  private verificarConflito(
    inicio1: Date,
    fim1: Date,
    inicio2: Date,
    fim2: Date
  ): boolean {
    return inicio1 < fim2 && inicio2 < fim1;
  }

  /**
   * Verifica se o slot respeita a antecedência mínima
   */
  private verificarAntecedencia(dataSlot: Date, antecedenciaHoras: number): boolean {
    const agora = new Date();
    const diferencaHoras = (dataSlot.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diferencaHoras >= antecedenciaHoras;
  }

  /**
   * Retorna configuração padrão de agenda
   * TODO: Buscar do banco de dados por profissional
   */
  private getConfiguracao(profissionalId: string): ConfiguracaoAgenda {
    return {
      horarioInicio: '08:00',
      horarioFim: '18:00',
      intervaloMinutos: 60,
      diasSemanaDisponiveis: [1, 2, 3, 4, 5], // Segunda a Sexta
      duracaoMinimaMinutos: 60,
      antecedenciaMinima: 24, // 24 horas
    };
  }

  /**
   * Cria um novo agendamento
   */
  async criarAgendamento(dados: Partial<Agendamento>): Promise<Agendamento> {
    // Verificar se o slot está disponível
    const slotsDisponiveis = await this.getSlotsDisponiveis(
      dados.profissionalId!,
      dados.dataHoraInicio!,
      dados.dataHoraFim!
    );

    const slotEscolhido = slotsDisponiveis.find(
      slot => slot.inicio.getTime() === dados.dataHoraInicio!.getTime()
    );

    if (!slotEscolhido || !slotEscolhido.disponivel) {
      throw new Error('Slot não disponível');
    }

    const agendamento = this.agendamentoRepository.create(dados);
    return await this.agendamentoRepository.save(agendamento);
  }

  /**
   * Confirma um agendamento (profissional)
   */
  async confirmarAgendamento(agendamentoId: string): Promise<Agendamento> {
    const agendamento = await this.agendamentoRepository.findOne({
      where: { id: agendamentoId },
    });

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    agendamento.status = AgendamentoStatus.CONFIRMADO;
    agendamento.confirmadoEm = new Date();

    return await this.agendamentoRepository.save(agendamento);
  }

  /**
   * Cancela um agendamento
   */
  async cancelarAgendamento(
    agendamentoId: string,
    motivo: string
  ): Promise<Agendamento> {
    const agendamento = await this.agendamentoRepository.findOne({
      where: { id: agendamentoId },
    });

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    agendamento.status = AgendamentoStatus.CANCELADO;
    agendamento.motivoCancelamento = motivo;

    return await this.agendamentoRepository.save(agendamento);
  }

  /**
   * Reagenda um agendamento (cancela o antigo e cria novo)
   */
  async reagendarAgendamento(
    agendamentoId: string,
    novaDataInicio: Date,
    novaDataFim: Date
  ): Promise<Agendamento> {
    const agendamentoAntigo = await this.agendamentoRepository.findOne({
      where: { id: agendamentoId },
    });

    if (!agendamentoAntigo) {
      throw new Error('Agendamento não encontrado');
    }

    // Marca o antigo como reagendado
    agendamentoAntigo.status = AgendamentoStatus.REAGENDADO;
    await this.agendamentoRepository.save(agendamentoAntigo);

    // Cria novo agendamento
    const novoAgendamento = await this.criarAgendamento({
      chamadoId: agendamentoAntigo.chamadoId,
      profissionalId: agendamentoAntigo.profissionalId,
      dataHoraInicio: novaDataInicio,
      dataHoraFim: novaDataFim,
      duracaoEstimadaMinutos: agendamentoAntigo.duracaoEstimadaMinutos,
      observacoes: `Reagendado de ${agendamentoAntigo.dataHoraInicio.toISOString()}`,
    });

    return novoAgendamento;
  }
}
