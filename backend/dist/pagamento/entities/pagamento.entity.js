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
exports.Pagamento = exports.MetodoPagamento = exports.StatusPagamento = void 0;
const typeorm_1 = require("typeorm");
const orcamento_entity_1 = require("../../orcamento/entities/orcamento.entity");
const profissional_entity_1 = require("../../profissional/entities/profissional.entity");
var StatusPagamento;
(function (StatusPagamento) {
    StatusPagamento["PENDENTE"] = "PENDENTE";
    StatusPagamento["PROCESSANDO"] = "PROCESSANDO";
    StatusPagamento["APROVADO"] = "APROVADO";
    StatusPagamento["RECUSADO"] = "RECUSADO";
    StatusPagamento["CANCELADO"] = "CANCELADO";
    StatusPagamento["ESTORNADO"] = "ESTORNADO";
})(StatusPagamento || (exports.StatusPagamento = StatusPagamento = {}));
var MetodoPagamento;
(function (MetodoPagamento) {
    MetodoPagamento["PIX"] = "PIX";
    MetodoPagamento["CREDITO"] = "CREDITO";
    MetodoPagamento["DEBITO"] = "DEBITO";
    MetodoPagamento["BOLETO"] = "BOLETO";
})(MetodoPagamento || (exports.MetodoPagamento = MetodoPagamento = {}));
let Pagamento = class Pagamento {
    // Alias para compatibilidade
    get valor() {
        return this.valorTotal;
    }
    // Alias para compatibilidade
    get createdAt() {
        return this.criadoEm;
    }
};
exports.Pagamento = Pagamento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Pagamento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orcamento_entity_1.Orcamento),
    (0, typeorm_1.JoinColumn)({ name: 'orcamentoId' }),
    __metadata("design:type", orcamento_entity_1.Orcamento)
], Pagamento.prototype, "orcamento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pagamento.prototype, "orcamentoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profissional_entity_1.Profissional),
    (0, typeorm_1.JoinColumn)({ name: 'profissionalId' }),
    __metadata("design:type", profissional_entity_1.Profissional)
], Pagamento.prototype, "profissional", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Pagamento.prototype, "profissionalId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pagamento.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pagamento.prototype, "valorProfissional", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Pagamento.prototype, "valorPlataforma", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: StatusPagamento.PENDENTE,
    }),
    __metadata("design:type", String)
], Pagamento.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
    }),
    __metadata("design:type", String)
], Pagamento.prototype, "metodoPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "mercadoPagoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "mercadoPagoStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "pixQrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "pixQrCodeData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "pixChave", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "dadosTransacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "linkPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pagamento.prototype, "dataExpiracao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pagamento.prototype, "dataAprovacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pagamento.prototype, "dataCancelamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pagamento.prototype, "motivoCancelamento", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pagamento.prototype, "criadoEm", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Pagamento.prototype, "atualizadoEm", void 0);
exports.Pagamento = Pagamento = __decorate([
    (0, typeorm_1.Entity)('pagamentos')
], Pagamento);
