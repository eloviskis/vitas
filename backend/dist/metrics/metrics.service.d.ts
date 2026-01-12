import { Repository } from 'typeorm';
import { Chamado } from '../chamado/entities/chamado.entity';
import { Orcamento } from '../orcamento/entities/orcamento.entity';
import { Pagamento } from '../pagamento/entities/pagamento.entity';
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
export declare class MetricsService {
    private chamadoRepository;
    private orcamentoRepository;
    private pagamentoRepository;
    constructor(chamadoRepository: Repository<Chamado>, orcamentoRepository: Repository<Orcamento>, pagamentoRepository: Repository<Pagamento>);
    getDashboardMetrics(): Promise<DashboardMetrics>;
}
