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
exports.Followup = exports.FollowupStatus = exports.FollowupTipo = void 0;
const typeorm_1 = require("typeorm");
const agendamento_entity_1 = require("../../agendamento/entities/agendamento.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
var FollowupTipo;
(function (FollowupTipo) {
    FollowupTipo["CONFIRMACAO"] = "CONFIRMACAO";
    FollowupTipo["LEMBRANCA"] = "LEMBRANCA";
    FollowupTipo["FEEDBACK"] = "FEEDBACK";
    FollowupTipo["RESOLUCAO"] = "RESOLUCAO";
})(FollowupTipo || (exports.FollowupTipo = FollowupTipo = {}));
var FollowupStatus;
(function (FollowupStatus) {
    FollowupStatus["PENDENTE"] = "PENDENTE";
    FollowupStatus["ENVIADO"] = "ENVIADO";
    FollowupStatus["RESPONDIDO"] = "RESPONDIDO";
    FollowupStatus["EXPIRADO"] = "EXPIRADO";
})(FollowupStatus || (exports.FollowupStatus = FollowupStatus = {}));
let Followup = class Followup {
};
exports.Followup = Followup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Followup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Followup.prototype, "agendamentoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => agendamento_entity_1.Agendamento, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'agendamentoId' }),
    __metadata("design:type", agendamento_entity_1.Agendamento)
], Followup.prototype, "agendamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Followup.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Followup.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Followup.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Followup.prototype, "mensagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Followup.prototype, "avaliacaoGeral", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Followup.prototype, "avaliacaoProfissional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Followup.prototype, "resposta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Followup.prototype, "comentarios", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Followup.prototype, "criadoEm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Followup.prototype, "dataEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Followup.prototype, "dataResposta", void 0);
exports.Followup = Followup = __decorate([
    (0, typeorm_1.Entity)({ name: 'followups' })
], Followup);
