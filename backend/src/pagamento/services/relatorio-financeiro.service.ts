import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pagamento, StatusPagamento } from '../entities/pagamento.entity';

@Injectable()
export class RelatorioFinanceiroService {
  constructor(
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {}

  async obterResumoFinanceiro(dataInicio: Date, dataFim: Date) {
    const pagamentos = await this.pagamentoRepository.find({
      where: {
        criadoEm: Between(dataInicio, dataFim),
        status: StatusPagamento.APROVADO,
      },
      relations: ['orcamento', 'orcamento.profissional'],
    });

    const totalBruto = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const comissaoPlataforma = pagamentos.reduce((sum, p) => sum + p.valorPlataforma, 0);
    const valorProfissionais = pagamentos.reduce((sum, p) => sum + p.valorProfissional, 0);

    const porMetodo = pagamentos.reduce((acc, p) => {
      acc[p.metodoPagamento] = (acc[p.metodoPagamento] || 0) + p.valor;
      return acc;
    }, {} as Record<string, number>);

    const topProfissionais = this.calcularTopProfissionais(pagamentos);

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      resumo: {
        totalTransacoes: pagamentos.length,
        valorBruto: totalBruto,
        comissaoPlataforma,
        valorLiquido: totalBruto - comissaoPlataforma,
        valorRepasses: valorProfissionais,
      },
      porMetodo,
      topProfissionais,
    };
  }

  private calcularTopProfissionais(pagamentos: any[]) {
    const profissionaisMap = new Map();

    pagamentos.forEach(p => {
      if (p.orcamento?.profissional) {
        const prof = p.orcamento.profissional;
        if (!profissionaisMap.has(prof.id)) {
          profissionaisMap.set(prof.id, {
            id: prof.id,
            nome: prof.nome,
            totalRecebido: 0,
            totalTransacoes: 0,
          });
        }
        const data = profissionaisMap.get(prof.id);
        data.totalRecebido += p.valorProfissional;
        data.totalTransacoes += 1;
      }
    });

    return Array.from(profissionaisMap.values())
      .sort((a, b) => b.totalRecebido - a.totalRecebido)
      .slice(0, 10);
  }

  async obterMetricasDiarias(dataInicio: Date, dataFim: Date) {
    const pagamentos = await this.pagamentoRepository.find({
      where: {
        criadoEm: Between(dataInicio, dataFim),
        status: StatusPagamento.APROVADO,
      },
    });

    const porDia = pagamentos.reduce((acc, p) => {
      const dia = p.criadoEm.toISOString().split('T')[0];
      if (!acc[dia]) {
        acc[dia] = { data: dia, total: 0, quantidade: 0 };
      }
      acc[dia].total += p.valor;
      acc[dia].quantidade += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(porDia).sort((a, b) => a.data.localeCompare(b.data));
  }

  async obterTaxaConversao(dataInicio: Date, dataFim: Date) {
    const total = await this.pagamentoRepository.count({
      where: { criadoEm: Between(dataInicio, dataFim) },
    });

    const aprovados = await this.pagamentoRepository.count({
      where: {
        criadoEm: Between(dataInicio, dataFim),
        status: StatusPagamento.APROVADO,
      },
    });

    return {
      total,
      aprovados,
      taxa: total > 0 ? (aprovados / total) * 100 : 0,
    };
  }
}
