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
exports.ScoreController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const score_rules_service_1 = require("../services/score-rules.service");
const profissional_service_1 = require("../../profissional/services/profissional.service");
let ScoreController = class ScoreController {
    constructor(scoreRulesService, profissionalService) {
        this.scoreRulesService = scoreRulesService;
        this.profissionalService = profissionalService;
    }
    async analisarScores(chamadoId, categoria, horario) {
        const profissionais = await this.profissionalService.listarAtivos(categoria);
        const horarioPreferido = horario ? new Date(horario) : undefined;
        const resultados = await this.scoreRulesService.rankearProfissionais(profissionais, categoria, horarioPreferido);
        return resultados.map((r) => ({
            profissional: {
                id: r.profissional.id,
                nome: r.profissional.nome,
            },
            scoreBase: r.scoreBase,
            scoreHistorico: r.scoreHistorico,
            scoreSazonalidade: r.scoreSazonalidade,
            penalidades: r.penalidades,
            scoreFinal: r.scoreFinal,
            detalhes: r.detalhes,
        }));
    }
    async obterScoreDetalhado(profissionalId, categoria) {
        const profissional = await this.profissionalService.obterPorId(profissionalId);
        const resultado = await this.scoreRulesService.calcularScoreAvancado(profissional, categoria);
        return {
            profissional: {
                id: profissional.id,
                nome: profissional.nome,
            },
            scores: {
                base: resultado.scoreBase,
                historico: resultado.scoreHistorico,
                sazonalidade: resultado.scoreSazonalidade,
                penalidades: resultado.penalidades,
                final: resultado.scoreFinal,
            },
            detalhes: resultado.detalhes,
        };
    }
};
exports.ScoreController = ScoreController;
__decorate([
    (0, common_1.Get)(':chamadoId/scores'),
    __param(0, (0, common_1.Param)('chamadoId')),
    __param(1, (0, common_1.Query)('categoria')),
    __param(2, (0, common_1.Query)('horario')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "analisarScores", null);
__decorate([
    (0, common_1.Get)('profissional/:profissionalId/score-detalhado'),
    __param(0, (0, common_1.Param)('profissionalId')),
    __param(1, (0, common_1.Query)('categoria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "obterScoreDetalhado", null);
exports.ScoreController = ScoreController = __decorate([
    (0, common_1.Controller)('triagem'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [score_rules_service_1.ScoreRulesService,
        profissional_service_1.ProfissionalService])
], ScoreController);
