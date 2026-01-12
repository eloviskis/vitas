import { Chamado } from '../../chamado/entities/chamado.entity';
import { Profissional } from '../../profissional/entities/profissional.entity';
import { User } from '../../auth/entities/user.entity';
export declare class Avaliacao {
    id: string;
    chamadoId: string;
    chamado: Promise<Chamado>;
    profissionalId: string;
    profissional: Promise<Profissional>;
    clienteId: string;
    cliente?: Promise<User>;
    notaGeral: number;
    get nota(): number;
    pontualidade: number;
    qualidade: number;
    comunicacao: number;
    recomenda: boolean;
    comentario?: string;
    respostaProfissional?: string;
    criadoEm: Date;
    get createdAt(): Date;
}
