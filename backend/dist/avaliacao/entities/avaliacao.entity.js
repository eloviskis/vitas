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
exports.Avaliacao = void 0;
const typeorm_1 = require("typeorm");
const chamado_entity_1 = require("../../chamado/entities/chamado.entity");
const profissional_entity_1 = require("../../profissional/entities/profissional.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
let Avaliacao = class Avaliacao {
    // Alias para compatibilidade
    get nota() {
        return this.notaGeral;
    }
    // Alias para compatibilidade
    get createdAt() {
        return this.criadoEm;
    }
};
exports.Avaliacao = Avaliacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Avaliacao.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Avaliacao.prototype, "chamadoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chamado_entity_1.Chamado, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'chamadoId' }),
    __metadata("design:type", Promise)
], Avaliacao.prototype, "chamado", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Avaliacao.prototype, "profissionalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profissional_entity_1.Profissional, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'profissionalId' }),
    __metadata("design:type", Promise)
], Avaliacao.prototype, "profissional", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Avaliacao.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { lazy: true }),
    (0, typeorm_1.JoinColumn)({ name: 'clienteId' }),
    __metadata("design:type", Promise)
], Avaliacao.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }) // 1-5
    ,
    __metadata("design:type", Number)
], Avaliacao.prototype, "notaGeral", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }) // 1-5
    ,
    __metadata("design:type", Number)
], Avaliacao.prototype, "pontualidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }) // 1-5
    ,
    __metadata("design:type", Number)
], Avaliacao.prototype, "qualidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }) // 1-5
    ,
    __metadata("design:type", Number)
], Avaliacao.prototype, "comunicacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Avaliacao.prototype, "recomenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Avaliacao.prototype, "comentario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Avaliacao.prototype, "respostaProfissional", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'criado_em' }),
    __metadata("design:type", Date)
], Avaliacao.prototype, "criadoEm", void 0);
exports.Avaliacao = Avaliacao = __decorate([
    (0, typeorm_1.Entity)({ name: 'avaliacoes' })
], Avaliacao);
