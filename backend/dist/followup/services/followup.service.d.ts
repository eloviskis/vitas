import { Repository } from 'typeorm';
import { Followup } from '../entities/followup.entity';
export declare class FollowupService {
    private followupRepository;
    constructor(followupRepository: Repository<Followup>);
    criar(dto: any): Promise<Followup>;
    enviar(id: string): Promise<Followup>;
    responder(id: string, dto: any): Promise<Followup>;
    obterPorId(id: string): Promise<Followup>;
    listarPorAgendamento(agendamentoId: string): Promise<Followup[]>;
    listarPendentes(): Promise<Followup[]>;
    obterMetricas(): Promise<{
        totalFollowups: number;
        respondidos: number;
        taxaResposta: number;
        avaliacaoMedia: any;
    }>;
}
