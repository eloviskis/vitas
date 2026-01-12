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
exports.RelatorioFinanceiroController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const relatorio_financeiro_service_1 = require("../services/relatorio-financeiro.service");
let RelatorioFinanceiroController = class RelatorioFinanceiroController {
    constructor(relatorioService) {
        this.relatorioService = relatorioService;
    }
    async resumo(dataInicio, dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fim = dataFim ? new Date(dataFim) : new Date();
        return await this.relatorioService.obterResumoFinanceiro(inicio, fim);
    }
    async metricasDiarias(dataInicio, dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fim = dataFim ? new Date(dataFim) : new Date();
        return await this.relatorioService.obterMetricasDiarias(inicio, fim);
    }
    async taxaConversao(dataInicio, dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fim = dataFim ? new Date(dataFim) : new Date();
        return await this.relatorioService.obterTaxaConversao(inicio, fim);
    }
};
exports.RelatorioFinanceiroController = RelatorioFinanceiroController;
__decorate([
    (0, common_1.Get)('resumo'),
    __param(0, (0, common_1.Query)('dataInicio')),
    __param(1, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "resumo", null);
__decorate([
    (0, common_1.Get)('diarias'),
    __param(0, (0, common_1.Query)('dataInicio')),
    __param(1, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "metricasDiarias", null);
__decorate([
    (0, common_1.Get)('conversao'),
    __param(0, (0, common_1.Query)('dataInicio')),
    __param(1, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "taxaConversao", null);
exports.RelatorioFinanceiroController = RelatorioFinanceiroController = __decorate([
    (0, common_1.Controller)('relatorios-financeiros'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [relatorio_financeiro_service_1.RelatorioFinanceiroService])
], RelatorioFinanceiroController);
