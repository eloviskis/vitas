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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chamado = exports.ChamadoStatus = void 0;
const typeorm_1 = require("typeorm");
const chamado_historico_entity_1 = require("./chamado-historico.entity");
const chamado_foto_entity_1 = require("./chamado-foto.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
var ChamadoStatus;
(function (ChamadoStatus) {
    ChamadoStatus["ABERTO"] = "ABERTO";
    ChamadoStatus["TRIADO"] = "TRIADO";
    ChamadoStatus["AGENDADO"] = "AGENDADO";
    ChamadoStatus["CONCLUIDO"] = "CONCLUIDO";
    ChamadoStatus["CANCELADO"] = "CANCELADO";
})(ChamadoStatus || (exports.ChamadoStatus = ChamadoStatus = {}));
let Chamado = class Chamado {
    // Alias para compatibilidade
    get createdAt() {
        return this.criadoEm;
    }
    get updatedAt() {
        return this.atualizadoEm;
    }
};
exports.Chamado = Chamado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Chamado.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id' }),
    __metadata("design:type", String)
], Chamado.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contexto' }),
    __metadata("design:type", String)
], Chamado.prototype, "contexto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Chamado.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: ChamadoStatus.ABERTO }),
    __metadata("design:type", String)
], Chamado.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Chamado.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Chamado.prototype, "metadados", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Chamado.prototype, "endereco", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Chamado.prototype, "cidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Chamado.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'criado_em' }),
    __metadata("design:type", Date)
], Chamado.prototype, "criadoEm", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'atualizado_em' }),
    __metadata("design:type", Date)
], Chamado.prototype, "atualizadoEm", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Promise)
], Chamado.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chamado_historico_entity_1.ChamadoHistorico, (historico) => historico.chamado, { cascade: true, eager: false }),
    __metadata("design:type", Array)
], Chamado.prototype, "historico", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chamado_foto_entity_1.ChamadoFoto, (foto) => foto.chamado, { cascade: true, eager: false }),
    __metadata("design:type", Array)
], Chamado.prototype, "fotos", void 0);
exports.Chamado = Chamado = __decorate([
    (0, typeorm_1.Entity)({ name: 'chamados' })
], Chamado);
