import { RelatorioFinanceiroService } from '../services/relatorio-financeiro.service';
export declare class RelatorioFinanceiroController {
    private relatorioService;
    constructor(relatorioService: RelatorioFinanceiroService);
    resumo(dataInicio: string, dataFim: string): Promise<{
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
    metricasDiarias(dataInicio: string, dataFim: string): Promise<any[]>;
    taxaConversao(dataInicio: string, dataFim: string): Promise<{
        total: number;
        aprovados: number;
        taxa: number;
    }>;
}
