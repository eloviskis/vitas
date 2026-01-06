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
exports.ChamadoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const chamado_service_1 = require("../services/chamado.service");
const chamado_dto_1 = require("../dtos/chamado.dto");
let ChamadoController = class ChamadoController {
    constructor(chamadoService) {
        this.chamadoService = chamadoService;
    }
    async criar(dto) {
        const chamado = await this.chamadoService.criar(dto);
        return this.mapToResponse(chamado);
    }
    async listarTodos() {
        const chamados = await this.chamadoService.listarTodos();
        return chamados.map((c) => this.mapToResponse(c));
    }
    async listarPorUsuario(usuarioId) {
        const chamados = await this.chamadoService.listarPorUsuario(usuarioId);
        return chamados.map((c) => this.mapToResponse(c));
    }
    async obter(id) {
        const chamado = await this.chamadoService.obterPorId(id);
        return this.mapToResponse(chamado);
    }
    async atualizar(id, dto) {
        const chamado = await this.chamadoService.atualizar(id, dto);
        return this.mapToResponse(chamado);
    }
    async deletar(id) {
        await this.chamadoService.deletar(id);
    }
    mapToResponse(chamado) {
        return {
            id: chamado.id,
            usuarioId: chamado.usuarioId,
            contexto: chamado.contexto,
            descricao: chamado.descricao,
            status: chamado.status,
            observacoes: chamado.observacoes,
            criadoEm: chamado.criadoEm,
            atualizadoEm: chamado.atualizadoEm,
        };
    }
};
exports.ChamadoController = ChamadoController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo chamado', description: 'Cria um novo chamado de manutenção' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Chamado criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Não autenticado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chamado_dto_1.CriarChamadoDto]),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os chamados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de chamados retornada' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "listarTodos", null);
__decorate([
    (0, common_1.Get)('usuario/:usuarioId'),
    __param(0, (0, common_1.Param)('usuarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "listarPorUsuario", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter chamado por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chamado encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chamado não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "obter", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, chamado_dto_1.AtualizarChamadoDto]),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChamadoController.prototype, "deletar", null);
exports.ChamadoController = ChamadoController = __decorate([
    (0, swagger_1.ApiTags)('Chamados'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('chamados'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chamado_service_1.ChamadoService])
], ChamadoController);
