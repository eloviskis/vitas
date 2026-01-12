import { FollowupTipo, FollowupStatus } from '../entities/followup.entity';
export declare class CriarFollowupDto {
    agendamentoId: string;
    tipo: FollowupTipo;
    mensagem: string;
    email?: string;
}
export declare class ResponderFollowupDto {
    resposta: string;
    avaliacaoGeral?: number;
    avaliacaoProfissional?: number;
    comentarios?: string;
}
export declare class FollowupResponseDto {
    id: string;
    agendamentoId: string;
    tipo: FollowupTipo;
    status: FollowupStatus;
    mensagem: string;
    resposta?: string;
    avaliacaoGeral?: number;
    avaliacaoProfissional?: number;
    criadoEm: Date;
}
