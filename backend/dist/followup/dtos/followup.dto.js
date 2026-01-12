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
exports.FollowupResponseDto = exports.ResponderFollowupDto = exports.CriarFollowupDto = void 0;
const class_validator_1 = require("class-validator");
const followup_entity_1 = require("../entities/followup.entity");
class CriarFollowupDto {
}
exports.CriarFollowupDto = CriarFollowupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarFollowupDto.prototype, "agendamentoId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(followup_entity_1.FollowupTipo),
    __metadata("design:type", String)
], CriarFollowupDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarFollowupDto.prototype, "mensagem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarFollowupDto.prototype, "email", void 0);
class ResponderFollowupDto {
}
exports.ResponderFollowupDto = ResponderFollowupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponderFollowupDto.prototype, "resposta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ResponderFollowupDto.prototype, "avaliacaoGeral", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ResponderFollowupDto.prototype, "avaliacaoProfissional", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponderFollowupDto.prototype, "comentarios", void 0);
class FollowupResponseDto {
}
exports.FollowupResponseDto = FollowupResponseDto;
