import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profissional } from '../../profissional/entities/profissional.entity';
import { Avaliacao } from '../../avaliacao/entities/avaliacao.entity';
import {
  Agendamento,
  AgendamentoStatus,
} from '../../agendamento/entities/agendamento.entity';

export interface ScoreCalculationResult {
  profissional: Profissional;
  scoreBase: number;
  scoreHistorico: number;
  scoreSazonalidade: number;
  penalidades: number;
  scoreFinal: number;
  detalhes: {
    mediaAvaliacoes: number;
    totalAvaliacoes: number;
    taxaAceitacao: number;
    diasUltimoServico: number;
    horaAdequada: boolean;
    diaAdequado: boolean;
  };
}

@Injectable()
export class ScoreRulesService {
  constructor(
    @InjectRepository(Profissional)
    private profissionalRepository: Repository<Profissional>,
    @InjectRepository(Avaliacao)
    private avaliacaoRepository: Repository<Avaliacao>,
    @InjectRepository(Agendamento)
    private agendamentoRepository: Repository<Agendamento>,
  ) {}

  async calcularScoreAvancado(
    profissional: Profissional,
    chamadoCategoria: string,
    horarioPreferido?: Date,
  ): Promise<ScoreCalculationResult> {
    // Score base (compatibilidade de categoria)
    const scoreBase = this.calcularScoreBase(profissional, chamadoCategoria);

    // Score de histórico (avaliações, experiência)
    const scoreHistorico = await this.calcularScoreHistorico(profissional.id);

    // Score de sazonalidade (horário, dia da semana)
    const scoreSazonalidade = await this.calcularScoreSazonalidade(
      profissional.id,
      horarioPreferido,
    );

    // Penalidades (rejeições, cancelamentos)
    const penalidades = await this.calcularPenalidades(profissional.id);

    // Score final ponderado
    const scoreFinal = this.calcularScoreFinal(
      scoreBase,
      scoreHistorico,
      scoreSazonalidade,
      penalidades,
    );

    return {
      profissional,
      scoreBase,
      scoreHistorico,
      scoreSazonalidade,
      penalidades,
      scoreFinal,
      detalhes: await this.obterDetalhes(profissional.id, horarioPreferido),
    };
  }

  private calcularScoreBase(profissional: Profissional, categoria: string): number {
    // Compatibilidade exata: 100 pontos
    if (profissional.categorias?.includes(categoria)) {
      return 100;
    }
    // Categoria relacionada: 50 pontos
    // TODO: Implementar mapa de categorias relacionadas
    return 0;
  }

  private async calcularScoreHistorico(profissionalId: string): Promise<number> {
    const avaliacoes = await this.avaliacaoRepository.find({
      where: { profissionalId },
    });

    if (avaliacoes.length === 0) {
      return 50; // Score neutro para novos profissionais
    }

    // Média de avaliações (0-5) convertida para 0-100
    const mediaAvaliacoes =
      avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length;
    const scoreAvaliacoes = (mediaAvaliacoes / 5) * 100;

    // Bônus por quantidade de avaliações (máx +20 pontos)
    const bonusQuantidade = Math.min(avaliacoes.length * 2, 20);

    // Bônus por avaliações recentes (últimos 30 dias, máx +10 pontos)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    const avaliacoesRecentes = avaliacoes.filter((a) => a.criadoEm >= dataLimite);
    const bonusRecentes = Math.min(avaliacoesRecentes.length * 2, 10);

    return Math.min(scoreAvaliacoes + bonusQuantidade + bonusRecentes, 100);
  }

  private async calcularScoreSazonalidade(
    profissionalId: string,
    horarioPreferido?: Date,
  ): Promise<number> {
    if (!horarioPreferido) {
      return 50; // Score neutro se não houver horário preferido
    }

    const agendamentos = await this.agendamentoRepository.find({
      where: { profissionalId, status: AgendamentoStatus.CONCLUIDO },
      order: { dataAgendamento: 'DESC' },
      take: 50, // Últimos 50 agendamentos
    });

    if (agendamentos.length < 5) {
      return 50; // Score neutro se histórico insuficiente
    }

    let score = 50;
    const hora = horarioPreferido.getHours();
    const diaSemana = horarioPreferido.getDay();

    // Análise de horário preferido
    const agendamentosPorHora = agendamentos.filter((a) => {
      const horaAgendamento = new Date(a.dataAgendamento).getHours();
      return Math.abs(horaAgendamento - hora) <= 2; // Janela de 2h
    });

    if (agendamentosPorHora.length > agendamentos.length * 0.3) {
      score += 20; // Profissional costuma trabalhar nesse horário
    }

    // Análise de dia da semana
    const agendamentosPorDia = agendamentos.filter(
      (a) => new Date(a.dataAgendamento).getDay() === diaSemana,
    );

    if (agendamentosPorDia.length > agendamentos.length * 0.2) {
      score += 15; // Profissional costuma trabalhar nesse dia
    }

    // Penalidade por última atividade muito antiga
    const ultimoAgendamento = agendamentos[0];
    const diasDesdeUltimo = Math.floor(
      (Date.now() - new Date(ultimoAgendamento.dataAgendamento).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diasDesdeUltimo > 60) {
      score -= 20; // Profissional inativo há mais de 60 dias
    } else if (diasDesdeUltimo > 30) {
      score -= 10; // Profissional pouco ativo
    }

    return Math.max(0, Math.min(score, 100));
  }

  private async calcularPenalidades(profissionalId: string): Promise<number> {
    const agendamentos = await this.agendamentoRepository.find({
      where: { profissionalId },
      order: { criadoEm: 'DESC' },
      take: 100, // Últimos 100 agendamentos
    });

    if (agendamentos.length < 5) {
      return 0; // Sem penalidades para profissionais novos
    }

    let penalidade = 0;

    // Taxa de cancelamentos pelo profissional
    const cancelados = agendamentos.filter(
      (a) => a.status === 'CANCELADO' && a.canceladoPor === 'PROFISSIONAL',
    );
    const taxaCancelamento = cancelados.length / agendamentos.length;

    if (taxaCancelamento > 0.15) {
      penalidade += 30; // Penalidade alta se >15% de cancelamentos
    } else if (taxaCancelamento > 0.1) {
      penalidade += 15; // Penalidade média se >10%
    }

    // Taxa de rejeições (cancelados/não compareceu)
    const rejeitados = agendamentos.filter(
      (a) =>
        a.status === AgendamentoStatus.CANCELADO ||
        a.status === AgendamentoStatus.NAOCOMPARECEU,
    );
    const taxaRejeicao = rejeitados.length / agendamentos.length;

    if (taxaRejeicao > 0.2) {
      penalidade += 25; // Penalidade alta se >20% de rejeições
    } else if (taxaRejeicao > 0.1) {
      penalidade += 10;
    }

    // Penalidade por avaliações baixas recentes
    const avaliacoesBaixas = await this.avaliacaoRepository
      .createQueryBuilder('a')
      .where('a.profissionalId = :profissionalId', { profissionalId })
      .andWhere('a.nota < 3')
      .andWhere('a.criadoEm > :dataLimite', {
        dataLimite: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .getCount();

    if (avaliacoesBaixas > 2) {
      penalidade += 20; // Penalidade por múltiplas avaliações baixas recentes
    }

    return Math.min(penalidade, 100); // Máximo de 100 pontos de penalidade
  }

  private calcularScoreFinal(
    scoreBase: number,
    scoreHistorico: number,
    scoreSazonalidade: number,
    penalidades: number,
  ): number {
    // Ponderação dos scores
    const PESO_BASE = 0.4; // 40% - Compatibilidade é crucial
    const PESO_HISTORICO = 0.35; // 35% - Experiência importante
    const PESO_SAZONALIDADE = 0.25; // 25% - Disponibilidade relevante

    const scoreTotal =
      scoreBase * PESO_BASE +
      scoreHistorico * PESO_HISTORICO +
      scoreSazonalidade * PESO_SAZONALIDADE;

    // Aplicar penalidades (redução direta)
    const scoreFinal = Math.max(0, scoreTotal - penalidades);

    return Math.round(scoreFinal * 10) / 10; // Arredondar para 1 casa decimal
  }

  private async obterDetalhes(profissionalId: string, horarioPreferido?: Date) {
    const avaliacoes = await this.avaliacaoRepository.find({
      where: { profissionalId },
    });

    const agendamentos = await this.agendamentoRepository.find({
      where: { profissionalId },
    });

    const aceitos = agendamentos.filter(
      (a) =>
        a.status !== AgendamentoStatus.CANCELADO &&
        a.status !== AgendamentoStatus.NAOCOMPARECEU,
    );
    const ultimoServico = agendamentos.sort(
      (a, b) =>
        new Date(b.dataAgendamento).getTime() -
        new Date(a.dataAgendamento).getTime(),
    )[0];

    const diasUltimoServico = ultimoServico
      ? Math.floor(
          (Date.now() - new Date(ultimoServico.dataAgendamento).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 999;

    let horaAdequada = true;
    let diaAdequado = true;

    if (horarioPreferido) {
      const hora = horarioPreferido.getHours();
      horaAdequada = hora >= 8 && hora <= 18; // Horário comercial padrão
      diaAdequado = horarioPreferido.getDay() >= 1 && horarioPreferido.getDay() <= 5;
    }

    return {
      mediaAvaliacoes:
        avaliacoes.length > 0
          ? avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length
          : 0,
      totalAvaliacoes: avaliacoes.length,
      taxaAceitacao: agendamentos.length > 0 ? aceitos.length / agendamentos.length : 0,
      diasUltimoServico,
      horaAdequada,
      diaAdequado,
    };
  }

  async rankearProfissionais(
    profissionais: Profissional[],
    chamadoCategoria: string,
    horarioPreferido?: Date,
  ): Promise<ScoreCalculationResult[]> {
    const resultados = await Promise.all(
      profissionais.map((p) =>
        this.calcularScoreAvancado(p, chamadoCategoria, horarioPreferido),
      ),
    );

    // Ordenar por score final (maior para menor)
    return resultados.sort((a, b) => b.scoreFinal - a.scoreFinal);
  }
}
