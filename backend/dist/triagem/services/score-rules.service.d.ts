import { Repository } from 'typeorm';
import { Profissional } from '../../profissional/entities/profissional.entity';
import { Avaliacao } from '../../avaliacao/entities/avaliacao.entity';
import { Agendamento } from '../../agendamento/entities/agendamento.entity';
export interface ScoreCalculationResult {
    profissional: Profissional;
    scoreBase: number;
    scoreHistorico: number;
    scoreSazonalidade: number;
    penalidades: number;
    scoreFinal: number;
    detalhes: {
        mediaAvaliacoes: number;
        totalAvaliacoes: number;
        taxaAceitacao: number;
        diasUltimoServico: number;
        horaAdequada: boolean;
        diaAdequado: boolean;
    };
}
export declare class ScoreRulesService {
    private profissionalRepository;
    private avaliacaoRepository;
    private agendamentoRepository;
    constructor(profissionalRepository: Repository<Profissional>, avaliacaoRepository: Repository<Avaliacao>, agendamentoRepository: Repository<Agendamento>);
    calcularScoreAvancado(profissional: Profissional, chamadoCategoria: string, horarioPreferido?: Date): Promise<ScoreCalculationResult>;
    private calcularScoreBase;
    private calcularScoreHistorico;
    private calcularScoreSazonalidade;
    private calcularPenalidades;
    private calcularScoreFinal;
    private obterDetalhes;
    rankearProfissionais(profissionais: Profissional[], chamadoCategoria: string, horarioPreferido?: Date): Promise<ScoreCalculationResult[]>;
}
