import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chamado, ChamadoStatus } from '../chamado/entities/chamado.entity';
import { Orcamento } from '../orcamento/entities/orcamento.entity';
import {
  Pagamento,
  StatusPagamento,
} from '../pagamento/entities/pagamento.entity';

export interface DashboardMetrics {
  chamadosAbertos: number;
  chamadosEmAtendimento: number;
  chamadosConcluidos: number;
  taxaConversao: number;
  ticketMedio: number;
  funil: FunilEtapa[];
  nps: NPSData;
  tendencias: {
    chamadosAbertosVariacao: number;
    concluidosVariacao: number;
    conversaoVariacao: number;
    ticketVariacao: number;
  };
}

export interface FunilEtapa {
  etapa: string;
  valor: number;
}

export interface NPSData {
  promotores: number;
  neutros: number;
  detratores: number;
  score: number;
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Chamado)
    private chamadoRepository: Repository<Chamado>,
    @InjectRepository(Orcamento)
    private orcamentoRepository: Repository<Orcamento>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Período atual (últimos 30 dias)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Chamados abertos (não concluídos)
    const chamadosAbertos = await this.chamadoRepository.count({
      where: [
        { status: ChamadoStatus.ABERTO },
        { status: ChamadoStatus.TRIADO },
        { status: ChamadoStatus.AGENDADO },
      ],
    });

    // Chamados em atendimento
    const chamadosEmAtendimento = await this.chamadoRepository.count({
      where: { status: ChamadoStatus.AGENDADO },
    });

    // Chamados concluídos (últimos 30 dias)
    const chamadosConcluidos = await this.chamadoRepository.count({
      where: {
        status: ChamadoStatus.CONCLUIDO,
        updatedAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    // Chamados concluídos (30-60 dias atrás) para comparação
    const concluidosMesAnterior = await this.chamadoRepository.count({
      where: {
        status: ChamadoStatus.CONCLUIDO,
        updatedAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    // Total de chamados criados nos últimos 30 dias
    const totalChamados = await this.chamadoRepository.count({
      where: {
        createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    // Total de pagamentos efetivados
    const pagamentosEfetivados = await this.pagamentoRepository.count({
      where: {
        status: StatusPagamento.APROVADO,
        createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    // Taxa de conversão (pagamentos / chamados criados)
    const taxaConversao = totalChamados > 0 
      ? (pagamentosEfetivados / totalChamados) * 100 
      : 0;

    // Calcular taxa de conversão do mês anterior para comparação
    const totalChamadosMesAnterior = await this.chamadoRepository.count({
      where: {
        createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    const pagamentosMesAnterior = await this.pagamentoRepository.count({
      where: {
        status: StatusPagamento.APROVADO,
        createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    const conversaoMesAnterior = totalChamadosMesAnterior > 0
      ? (pagamentosMesAnterior / totalChamadosMesAnterior) * 100
      : 0;

    // Ticket médio (média de valores de pagamentos confirmados)
    const pagamentosConfirmados = await this.pagamentoRepository.find({
      where: {
        status: StatusPagamento.APROVADO,
        createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    const ticketMedio = pagamentosConfirmados.length > 0
      ? pagamentosConfirmados.reduce((sum, p) => sum + Number(p.valor), 0) / pagamentosConfirmados.length
      : 0;

    const pagamentosConfirmadosMesAnterior = await this.pagamentoRepository.find({
      where: {
        status: StatusPagamento.APROVADO,
        createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]) as any,
      },
    });

    const ticketMesAnterior = pagamentosConfirmadosMesAnterior.length > 0
      ? pagamentosConfirmadosMesAnterior.reduce((sum, p) => sum + Number(p.valor), 0) / pagamentosConfirmadosMesAnterior.length
      : 0;

    // Funil de conversão
    const triados = await this.chamadoRepository.count({
      where: [
        { status: ChamadoStatus.TRIADO },
        { status: ChamadoStatus.AGENDADO },
        { status: ChamadoStatus.CONCLUIDO },
      ],
    });

    const orcamentosEnviados = await this.orcamentoRepository.count();

    const funil: FunilEtapa[] = [
      { etapa: 'Leads', valor: totalChamados },
      { etapa: 'Triagem concluída', valor: triados },
      { etapa: 'Orçamentos enviados', valor: orcamentosEnviados },
      { etapa: 'Pagamentos', valor: pagamentosEfetivados },
    ];

    // NPS - Por ora, retornar dados mockados (implementar avaliações depois)
    const nps: NPSData = {
      promotores: 62,
      neutros: 24,
      detratores: 14,
      score: 48, // (promotores - detratores)
    };

    // Tendências (variações percentuais)
    const tendencias = {
      chamadosAbertosVariacao: chamadosAbertos - chamadosEmAtendimento,
      concluidosVariacao: concluidosMesAnterior > 0 
        ? ((chamadosConcluidos - concluidosMesAnterior) / concluidosMesAnterior) * 100
        : 0,
      conversaoVariacao: conversaoMesAnterior > 0
        ? taxaConversao - conversaoMesAnterior
        : 0,
      ticketVariacao: ticketMesAnterior > 0
        ? ticketMedio - ticketMesAnterior
        : 0,
    };

    return {
      chamadosAbertos,
      chamadosEmAtendimento,
      chamadosConcluidos,
      taxaConversao,
      ticketMedio,
      funil,
      nps,
      tendencias,
    };
  }
}
