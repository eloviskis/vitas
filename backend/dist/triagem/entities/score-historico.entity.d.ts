import { Profissional } from '../../profissional/entities/profissional.entity';
export declare class ScoreHistorico {
    id: string;
    profissionalId: string;
    profissional: Profissional;
    scoreBase: number;
    scoreHistorico: number;
    scoreSazonalidade: number;
    penalidades: number;
    scoreFinal: number;
    categoria: string;
    detalhes: any;
    criadoEm: Date;
}
