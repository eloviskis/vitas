import { FollowupService } from '../services/followup.service';
import { CriarFollowupDto, ResponderFollowupDto } from '../dtos/followup.dto';
export declare class FollowupController {
    private followupService;
    constructor(followupService: FollowupService);
    criar(dto: CriarFollowupDto): Promise<import("../entities/followup.entity").Followup>;
    obter(id: string): Promise<import("../entities/followup.entity").Followup>;
    listarPorAgendamento(agendamentoId: string): Promise<import("../entities/followup.entity").Followup[]>;
    enviar(id: string): Promise<import("../entities/followup.entity").Followup>;
    responder(id: string, dto: ResponderFollowupDto): Promise<import("../entities/followup.entity").Followup>;
    metricas(): Promise<{
        totalFollowups: number;
        respondidos: number;
        taxaResposta: number;
        avaliacaoMedia: any;
    }>;
    listarPendentes(): Promise<import("../entities/followup.entity").Followup[]>;
}
