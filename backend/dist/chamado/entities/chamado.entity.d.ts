import { ChamadoHistorico } from './chamado-historico.entity';
import { ChamadoFoto } from './chamado-foto.entity';
import { User } from '../../auth/entities/user.entity';
export declare enum ChamadoStatus {
    ABERTO = "ABERTO",
    TRIADO = "TRIADO",
    AGENDADO = "AGENDADO",
    CONCLUIDO = "CONCLUIDO",
    CANCELADO = "CANCELADO"
}
export declare class Chamado {
    id: string;
    usuarioId: string;
    contexto: string;
    descricao: string;
    status: ChamadoStatus;
    observacoes?: string;
    metadados?: Record<string, any>;
    endereco?: string;
    cidade?: string;
    estado?: string;
    criadoEm: Date;
    atualizadoEm: Date;
    get createdAt(): Date;
    get updatedAt(): Date;
    cliente?: Promise<User>;
    historico?: ChamadoHistorico[];
    fotos?: ChamadoFoto[];
}
