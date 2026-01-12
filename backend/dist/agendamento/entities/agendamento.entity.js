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
exports.Agendamento = exports.AgendamentoStatus = void 0;
const typeorm_1 = require("typeorm");
const chamado_entity_1 = require("../../chamado/entities/chamado.entity");
const profissional_entity_1 = require("../../profissional/entities/profissional.entity");
const slot_entity_1 = require("./slot.entity");
var AgendamentoStatus;
(function (AgendamentoStatus) {
    AgendamentoStatus["PENDENTE"] = "PENDENTE";
    AgendamentoStatus["CONFIRMADO"] = "CONFIRMADO";
    AgendamentoStatus["EM_ATENDIMENTO"] = "EM_ATENDIMENTO";
    AgendamentoStatus["CONCLUIDO"] = "CONCLUIDO";
    AgendamentoStatus["CANCELADO"] = "CANCELADO";
    AgendamentoStatus["NAOCOMPARECEU"] = "NAOCOMPARECEU";
})(AgendamentoStatus || (exports.AgendamentoStatus = AgendamentoStatus = {}));
let Agendamento = class Agendamento {
    // Alias para compatibilidade
    get dataAgendamento() {
        return this.dataHora;
    }
};
exports.Agendamento = Agendamento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Agendamento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'chamado_id' }),
    __metadata("design:type", String)
], Agendamento.prototype, "chamadoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profissional_id' }),
    __metadata("design:type", String)
], Agendamento.prototype, "profissionalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'slot_id', nullable: true }),
    __metadata("design:type", String)
], Agendamento.prototype, "slotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Agendamento.prototype, "dataHora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 60 }),
    __metadata("design:type", Number)
], Agendamento.prototype, "duracao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: AgendamentoStatus.PENDENTE }),
    __metadata("design:type", String)
], Agendamento.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Agendamento.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Agendamento.prototype, "confirmadoEm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Agendamento.prototype, "canceladoEm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Agendamento.prototype, "motivoCancelamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Agendamento.prototype, "canceladoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Agendamento.prototype, "inicioAtendimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Agendamento.prototype, "fimAtendimento", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'criado_em' }),
    __metadata("design:type", Date)
], Agendamento.prototype, "criadoEm", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'atualizado_em' }),
    __metadata("design:type", Date)
], Agendamento.prototype, "atualizadoEm", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chamado_entity_1.Chamado, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'chamado_id' }),
    __metadata("design:type", chamado_entity_1.Chamado)
], Agendamento.prototype, "chamado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profissional_entity_1.Profissional, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'profissional_id' }),
    __metadata("design:type", profissional_entity_1.Profissional)
], Agendamento.prototype, "profissional", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => slot_entity_1.Slot, { onDelete: 'SET NULL', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'slot_id' }),
    __metadata("design:type", slot_entity_1.Slot)
], Agendamento.prototype, "slot", void 0);
exports.Agendamento = Agendamento = __decorate([
    (0, typeorm_1.Index)('idx_agendamento_chamado', ['chamadoId']),
    (0, typeorm_1.Index)('idx_agendamento_profissional', ['profissionalId']),
    (0, typeorm_1.Index)('idx_agendamento_status', ['status']),
    (0, typeorm_1.Index)('idx_agendamento_data', ['dataHora']),
    (0, typeorm_1.Entity)({ name: 'agendamentos' })
], Agendamento);
