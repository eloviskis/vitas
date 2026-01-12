import { Agendamento } from '../../agendamento/entities/agendamento.entity';
import { User } from '../../auth/entities/user.entity';
export declare enum FollowupTipo {
    CONFIRMACAO = "CONFIRMACAO",
    LEMBRANCA = "LEMBRANCA",
    FEEDBACK = "FEEDBACK",
    RESOLUCAO = "RESOLUCAO"
}
export declare enum FollowupStatus {
    PENDENTE = "PENDENTE",
    ENVIADO = "ENVIADO",
    RESPONDIDO = "RESPONDIDO",
    EXPIRADO = "EXPIRADO"
}
export declare class Followup {
    id: string;
    agendamentoId: string;
    agendamento: Agendamento;
    usuario: User;
    tipo: FollowupTipo;
    status: FollowupStatus;
    mensagem: string;
    avaliacaoGeral?: number;
    avaliacaoProfissional?: number;
    resposta?: string;
    comentarios?: string;
    criadoEm: Date;
    dataEnvio?: Date;
    dataResposta?: Date;
}
