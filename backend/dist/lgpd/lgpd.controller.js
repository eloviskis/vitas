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
exports.LgpdController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lgpd_service_1 = require("./lgpd.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let LgpdController = class LgpdController {
    constructor(lgpdService) {
        this.lgpdService = lgpdService;
    }
    async exportMyData(req) {
        return this.lgpdService.exportUserData(req.user.userId);
    }
    async requestAccountDeletion(req) {
        return this.lgpdService.requestDeletion(req.user.userId);
    }
    async getConsent(req) {
        return this.lgpdService.getConsent(req.user.userId);
    }
};
exports.LgpdController = LgpdController;
__decorate([
    (0, common_1.Get)('my-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar todos os dados do usuário (LGPD Art. 18)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados exportados em formato JSON',
        schema: {
            example: {
                usuario: { id: '...', email: '...', nome: '...' },
                chamados: [],
                pagamentos: [],
                avaliacoes: []
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "exportMyData", null);
__decorate([
    (0, common_1.Delete)('delete-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar exclusão de conta (LGPD Art. 18)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Solicitação de exclusão registrada',
        schema: {
            example: {
                message: 'Sua solicitação de exclusão foi registrada e será processada em até 30 dias',
                dataExclusao: '2026-02-10T00:00:00.000Z'
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "requestAccountDeletion", null);
__decorate([
    (0, common_1.Get)('consent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obter status de consentimento do usuário' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "getConsent", null);
exports.LgpdController = LgpdController = __decorate([
    (0, swagger_1.ApiTags)('LGPD'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('lgpd'),
    __metadata("design:paramtypes", [lgpd_service_1.LgpdService])
], LgpdController);
