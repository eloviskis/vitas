import { Chamado } from '../../chamado/entities/chamado.entity';
import { Profissional } from '../../profissional/entities/profissional.entity';
import { Slot } from './slot.entity';
export declare enum AgendamentoStatus {
    PENDENTE = "PENDENTE",
    CONFIRMADO = "CONFIRMADO",
    EM_ATENDIMENTO = "EM_ATENDIMENTO",
    CONCLUIDO = "CONCLUIDO",
    CANCELADO = "CANCELADO",
    NAOCOMPARECEU = "NAOCOMPARECEU"
}
export declare class Agendamento {
    id: string;
    chamadoId: string;
    profissionalId: string;
    slotId?: string;
    dataHora: Date;
    duracao: number;
    status: AgendamentoStatus;
    observacoes?: string;
    confirmadoEm?: Date;
    canceladoEm?: Date;
    motivoCancelamento?: string;
    canceladoPor?: string;
    inicioAtendimento?: Date;
    fimAtendimento?: Date;
    criadoEm: Date;
    atualizadoEm: Date;
    get dataAgendamento(): Date;
    chamado?: Chamado;
    profissional?: Profissional;
    slot?: Slot;
}
