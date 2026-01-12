import { ScoreRulesService } from '../services/score-rules.service';
import { ProfissionalService } from '../../profissional/services/profissional.service';
export declare class ScoreController {
    private scoreRulesService;
    private profissionalService;
    constructor(scoreRulesService: ScoreRulesService, profissionalService: ProfissionalService);
    analisarScores(chamadoId: string, categoria: string, horario?: string): Promise<{
        profissional: {
            id: string;
            nome: string;
        };
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
    }[]>;
    obterScoreDetalhado(profissionalId: string, categoria: string): Promise<{
        profissional: {
            id: string;
            nome: string;
        };
        scores: {
            base: number;
            historico: number;
            sazonalidade: number;
            penalidades: number;
            final: number;
        };
        detalhes: {
            mediaAvaliacoes: number;
            totalAvaliacoes: number;
            taxaAceitacao: number;
            diasUltimoServico: number;
            horaAdequada: boolean;
            diaAdequado: boolean;
        };
    }>;
}
