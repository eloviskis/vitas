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
exports.FollowupController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const followup_service_1 = require("../services/followup.service");
const followup_dto_1 = require("../dtos/followup.dto");
let FollowupController = class FollowupController {
    constructor(followupService) {
        this.followupService = followupService;
    }
    async criar(dto) {
        return await this.followupService.criar(dto);
    }
    async obter(id) {
        return await this.followupService.obterPorId(id);
    }
    async listarPorAgendamento(agendamentoId) {
        return await this.followupService.listarPorAgendamento(agendamentoId);
    }
    async enviar(id) {
        return await this.followupService.enviar(id);
    }
    async responder(id, dto) {
        return await this.followupService.responder(id, dto);
    }
    async metricas() {
        return await this.followupService.obterMetricas();
    }
    async listarPendentes() {
        return await this.followupService.listarPendentes();
    }
};
exports.FollowupController = FollowupController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [followup_dto_1.CriarFollowupDto]),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "obter", null);
__decorate([
    (0, common_1.Get)('agendamento/:agendamentoId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('agendamentoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "listarPorAgendamento", null);
__decorate([
    (0, common_1.Put)(':id/enviar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "enviar", null);
__decorate([
    (0, common_1.Put)(':id/responder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, followup_dto_1.ResponderFollowupDto]),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "responder", null);
__decorate([
    (0, common_1.Get)('metricas/geral'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "metricas", null);
__decorate([
    (0, common_1.Get)('pendentes/lista'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FollowupController.prototype, "listarPendentes", null);
exports.FollowupController = FollowupController = __decorate([
    (0, common_1.Controller)('followups'),
    __metadata("design:paramtypes", [followup_service_1.FollowupService])
], FollowupController);
