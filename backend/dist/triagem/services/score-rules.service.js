"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profissional_entity_1 = require("../../profissional/entities/profissional.entity");
const avaliacao_entity_1 = require("../../avaliacao/entities/avaliacao.entity");
const agendamento_entity_1 = require("../../agendamento/entities/agendamento.entity");
let ScoreRulesService = class ScoreRulesService {
    constructor(profissionalRepository, avaliacaoRepository, agendamentoRepository) {
        this.profissionalRepository = profissionalRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.agendamentoRepository = agendamentoRepository;
    }
    async calcularScoreAvancado(profissional, chamadoCategoria, horarioPreferido) {
        // Score base (compatibilidade de categoria)
        const scoreBase = this.calcularScoreBase(profissional, chamadoCategoria);
        // Score de histórico (avaliações, experiência)
        const scoreHistorico = await this.calcularScoreHistorico(profissional.id);
        // Score de sazonalidade (horário, dia da semana)
        const scoreSazonalidade = await this.calcularScoreSazonalidade(profissional.id, horarioPreferido);
        // Penalidades (rejeições, cancelamentos)
        const penalidades = await this.calcularPenalidades(profissional.id);
        // Score final ponderado
        const scoreFinal = this.calcularScoreFinal(scoreBase, scoreHistorico, scoreSazonalidade, penalidades);
        return {
            profissional,
            scoreBase,
            scoreHistorico,
            scoreSazonalidade,
            penalidades,
            scoreFinal,
            detalhes: await this.obterDetalhes(profissional.id, horarioPreferido),
        };
    }
    calcularScoreBase(profissional, categoria) {
        // Compatibilidade exata: 100 pontos
        if (profissional.categorias?.includes(categoria)) {
            return 100;
        }
        // Categoria relacionada: 50 pontos
        // TODO: Implementar mapa de categorias relacionadas
        return 0;
    }
    async calcularScoreHistorico(profissionalId) {
        const avaliacoes = await this.avaliacaoRepository.find({
            where: { profissionalId },
        });
        if (avaliacoes.length === 0) {
            return 50; // Score neutro para novos profissionais
        }
        // Média de avaliações (0-5) convertida para 0-100
        const mediaAvaliacoes = avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length;
        const scoreAvaliacoes = (mediaAvaliacoes / 5) * 100;
        // Bônus por quantidade de avaliações (máx +20 pontos)
        const bonusQuantidade = Math.min(avaliacoes.length * 2, 20);
        // Bônus por avaliações recentes (últimos 30 dias, máx +10 pontos)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        const avaliacoesRecentes = avaliacoes.filter((a) => a.criadoEm >= dataLimite);
        const bonusRecentes = Math.min(avaliacoesRecentes.length * 2, 10);
        return Math.min(scoreAvaliacoes + bonusQuantidade + bonusRecentes, 100);
    }
    async calcularScoreSazonalidade(profissionalId, horarioPreferido) {
        if (!horarioPreferido) {
            return 50; // Score neutro se não houver horário preferido
        }
        const agendamentos = await this.agendamentoRepository.find({
            where: { profissionalId, status: agendamento_entity_1.AgendamentoStatus.CONCLUIDO },
            order: { dataAgendamento: 'DESC' },
            take: 50, // Últimos 50 agendamentos
        });
        if (agendamentos.length < 5) {
            return 50; // Score neutro se histórico insuficiente
        }
        let score = 50;
        const hora = horarioPreferido.getHours();
        const diaSemana = horarioPreferido.getDay();
        // Análise de horário preferido
        const agendamentosPorHora = agendamentos.filter((a) => {
            const horaAgendamento = new Date(a.dataAgendamento).getHours();
            return Math.abs(horaAgendamento - hora) <= 2; // Janela de 2h
        });
        if (agendamentosPorHora.length > agendamentos.length * 0.3) {
            score += 20; // Profissional costuma trabalhar nesse horário
        }
        // Análise de dia da semana
        const agendamentosPorDia = agendamentos.filter((a) => new Date(a.dataAgendamento).getDay() === diaSemana);
        if (agendamentosPorDia.length > agendamentos.length * 0.2) {
            score += 15; // Profissional costuma trabalhar nesse dia
        }
        // Penalidade por última atividade muito antiga
        const ultimoAgendamento = agendamentos[0];
        const diasDesdeUltimo = Math.floor((Date.now() - new Date(ultimoAgendamento.dataAgendamento).getTime()) /
            (1000 * 60 * 60 * 24));
        if (diasDesdeUltimo > 60) {
            score -= 20; // Profissional inativo há mais de 60 dias
        }
        else if (diasDesdeUltimo > 30) {
            score -= 10; // Profissional pouco ativo
        }
        return Math.max(0, Math.min(score, 100));
    }
    async calcularPenalidades(profissionalId) {
        const agendamentos = await this.agendamentoRepository.find({
            where: { profissionalId },
            order: { criadoEm: 'DESC' },
            take: 100, // Últimos 100 agendamentos
        });
        if (agendamentos.length < 5) {
            return 0; // Sem penalidades para profissionais novos
        }
        let penalidade = 0;
        // Taxa de cancelamentos pelo profissional
        const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO' && a.canceladoPor === 'PROFISSIONAL');
        const taxaCancelamento = cancelados.length / agendamentos.length;
        if (taxaCancelamento > 0.15) {
            penalidade += 30; // Penalidade alta se >15% de cancelamentos
        }
        else if (taxaCancelamento > 0.1) {
            penalidade += 15; // Penalidade média se >10%
        }
        // Taxa de rejeições (cancelados/não compareceu)
        const rejeitados = agendamentos.filter((a) => a.status === agendamento_entity_1.AgendamentoStatus.CANCELADO ||
            a.status === agendamento_entity_1.AgendamentoStatus.NAOCOMPARECEU);
        const taxaRejeicao = rejeitados.length / agendamentos.length;
        if (taxaRejeicao > 0.2) {
            penalidade += 25; // Penalidade alta se >20% de rejeições
        }
        else if (taxaRejeicao > 0.1) {
            penalidade += 10;
        }
        // Penalidade por avaliações baixas recentes
        const avaliacoesBaixas = await this.avaliacaoRepository
            .createQueryBuilder('a')
            .where('a.profissionalId = :profissionalId', { profissionalId })
            .andWhere('a.nota < 3')
            .andWhere('a.criadoEm > :dataLimite', {
            dataLimite: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        })
            .getCount();
        if (avaliacoesBaixas > 2) {
            penalidade += 20; // Penalidade por múltiplas avaliações baixas recentes
        }
        return Math.min(penalidade, 100); // Máximo de 100 pontos de penalidade
    }
    calcularScoreFinal(scoreBase, scoreHistorico, scoreSazonalidade, penalidades) {
        // Ponderação dos scores
        const PESO_BASE = 0.4; // 40% - Compatibilidade é crucial
        const PESO_HISTORICO = 0.35; // 35% - Experiência importante
        const PESO_SAZONALIDADE = 0.25; // 25% - Disponibilidade relevante
        const scoreTotal = scoreBase * PESO_BASE +
            scoreHistorico * PESO_HISTORICO +
            scoreSazonalidade * PESO_SAZONALIDADE;
        // Aplicar penalidades (redução direta)
        const scoreFinal = Math.max(0, scoreTotal - penalidades);
        return Math.round(scoreFinal * 10) / 10; // Arredondar para 1 casa decimal
    }
    async obterDetalhes(profissionalId, horarioPreferido) {
        const avaliacoes = await this.avaliacaoRepository.find({
            where: { profissionalId },
        });
        const agendamentos = await this.agendamentoRepository.find({
            where: { profissionalId },
        });
        const aceitos = agendamentos.filter((a) => a.status !== agendamento_entity_1.AgendamentoStatus.CANCELADO &&
            a.status !== agendamento_entity_1.AgendamentoStatus.NAOCOMPARECEU);
        const ultimoServico = agendamentos.sort((a, b) => new Date(b.dataAgendamento).getTime() -
            new Date(a.dataAgendamento).getTime())[0];
        const diasUltimoServico = ultimoServico
            ? Math.floor((Date.now() - new Date(ultimoServico.dataAgendamento).getTime()) /
                (1000 * 60 * 60 * 24))
            : 999;
        let horaAdequada = true;
        let diaAdequado = true;
        if (horarioPreferido) {
            const hora = horarioPreferido.getHours();
            horaAdequada = hora >= 8 && hora <= 18; // Horário comercial padrão
            diaAdequado = horarioPreferido.getDay() >= 1 && horarioPreferido.getDay() <= 5;
        }
        return {
            mediaAvaliacoes: avaliacoes.length > 0
                ? avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length
                : 0,
            totalAvaliacoes: avaliacoes.length,
            taxaAceitacao: agendamentos.length > 0 ? aceitos.length / agendamentos.length : 0,
            diasUltimoServico,
            horaAdequada,
            diaAdequado,
        };
    }
    async rankearProfissionais(profissionais, chamadoCategoria, horarioPreferido) {
        const resultados = await Promise.all(profissionais.map((p) => this.calcularScoreAvancado(p, chamadoCategoria, horarioPreferido)));
        // Ordenar por score final (maior para menor)
        return resultados.sort((a, b) => b.scoreFinal - a.scoreFinal);
    }
};
exports.ScoreRulesService = ScoreRulesService;
exports.ScoreRulesService = ScoreRulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profissional_entity_1.Profissional)),
    __param(1, (0, typeorm_1.InjectRepository)(avaliacao_entity_1.Avaliacao)),
    __param(2, (0, typeorm_1.InjectRepository)(agendamento_entity_1.Agendamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ScoreRulesService);
