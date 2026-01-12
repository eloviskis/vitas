import { Repository } from 'typeorm';
import { Pagamento } from '../entities/pagamento.entity';
export declare class RelatorioFinanceiroService {
    private pagamentoRepository;
    constructor(pagamentoRepository: Repository<Pagamento>);
    obterResumoFinanceiro(dataInicio: Date, dataFim: Date): Promise<{
        periodo: {
            inicio: Date;
            fim: Date;
        };
        resumo: {
            totalTransacoes: number;
            valorBruto: number;
            comissaoPlataforma: number;
            valorLiquido: number;
            valorRepasses: number;
        };
        porMetodo: Record<string, number>;
        topProfissionais: any[];
    }>;
    private calcularTopProfissionais;
    obterMetricasDiarias(dataInicio: Date, dataFim: Date): Promise<any[]>;
    obterTaxaConversao(dataInicio: Date, dataFim: Date): Promise<{
        total: number;
        aprovados: number;
        taxa: number;
    }>;
}
