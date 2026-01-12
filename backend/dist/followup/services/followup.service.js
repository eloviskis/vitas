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
exports.FollowupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const followup_entity_1 = require("../entities/followup.entity");
let FollowupService = class FollowupService {
    constructor(followupRepository) {
        this.followupRepository = followupRepository;
    }
    async criar(dto) {
        const followup = new followup_entity_1.Followup();
        followup.agendamentoId = dto.agendamentoId;
        followup.tipo = dto.tipo;
        followup.mensagem = dto.mensagem;
        followup.status = followup_entity_1.FollowupStatus.PENDENTE;
        return await this.followupRepository.save(followup);
    }
    async enviar(id) {
        const followup = await this.obterPorId(id);
        followup.status = followup_entity_1.FollowupStatus.ENVIADO;
        followup.dataEnvio = new Date();
        return await this.followupRepository.save(followup);
    }
    async responder(id, dto) {
        const followup = await this.obterPorId(id);
        Object.assign(followup, {
            ...dto,
            status: followup_entity_1.FollowupStatus.RESPONDIDO,
            dataResposta: new Date(),
        });
        return await this.followupRepository.save(followup);
    }
    async obterPorId(id) {
        const followup = await this.followupRepository.findOne({
            where: { id },
            relations: ['agendamento', 'usuario'],
        });
        if (!followup) {
            throw new common_1.NotFoundException(`Followup ${id} não encontrado`);
        }
        return followup;
    }
    async listarPorAgendamento(agendamentoId) {
        return await this.followupRepository.find({
            where: { agendamentoId },
            order: { criadoEm: 'DESC' },
        });
    }
    async listarPendentes() {
        return await this.followupRepository.find({
            where: { status: followup_entity_1.FollowupStatus.PENDENTE },
            relations: ['agendamento', 'usuario'],
            order: { criadoEm: 'DESC' },
        });
    }
    async obterMetricas() {
        const total = await this.followupRepository.count();
        const respondidos = await this.followupRepository.count({
            where: { status: followup_entity_1.FollowupStatus.RESPONDIDO },
        });
        const avaliacoes = await this.followupRepository
            .createQueryBuilder('f')
            .select('AVG(f.avaliacaoGeral)', 'media')
            .where('f.avaliacaoGeral IS NOT NULL')
            .getRawOne();
        return {
            totalFollowups: total,
            respondidos,
            taxaResposta: total > 0 ? (respondidos / total) * 100 : 0,
            avaliacaoMedia: avaliacoes?.media || 0,
        };
    }
};
exports.FollowupService = FollowupService;
exports.FollowupService = FollowupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(followup_entity_1.Followup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FollowupService);
