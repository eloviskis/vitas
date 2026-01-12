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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chamado_entity_1 = require("../chamado/entities/chamado.entity");
const orcamento_entity_1 = require("../orcamento/entities/orcamento.entity");
const pagamento_entity_1 = require("../pagamento/entities/pagamento.entity");
let MetricsService = class MetricsService {
    constructor(chamadoRepository, orcamentoRepository, pagamentoRepository) {
        this.chamadoRepository = chamadoRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.pagamentoRepository = pagamentoRepository;
    }
    async getDashboardMetrics() {
        // Período atual (últimos 30 dias)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        // Chamados abertos (não concluídos)
        const chamadosAbertos = await this.chamadoRepository.count({
            where: [
                { status: chamado_entity_1.ChamadoStatus.ABERTO },
                { status: chamado_entity_1.ChamadoStatus.TRIADO },
                { status: chamado_entity_1.ChamadoStatus.AGENDADO },
            ],
        });
        // Chamados em atendimento
        const chamadosEmAtendimento = await this.chamadoRepository.count({
            where: { status: chamado_entity_1.ChamadoStatus.AGENDADO },
        });
        // Chamados concluídos (últimos 30 dias)
        const chamadosConcluidos = await this.chamadoRepository.count({
            where: {
                status: chamado_entity_1.ChamadoStatus.CONCLUIDO,
                updatedAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        // Chamados concluídos (30-60 dias atrás) para comparação
        const concluidosMesAnterior = await this.chamadoRepository.count({
            where: {
                status: chamado_entity_1.ChamadoStatus.CONCLUIDO,
                updatedAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        // Total de chamados criados nos últimos 30 dias
        const totalChamados = await this.chamadoRepository.count({
            where: {
                createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        // Total de pagamentos efetivados
        const pagamentosEfetivados = await this.pagamentoRepository.count({
            where: {
                status: pagamento_entity_1.StatusPagamento.APROVADO,
                createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        // Taxa de conversão (pagamentos / chamados criados)
        const taxaConversao = totalChamados > 0
            ? (pagamentosEfetivados / totalChamados) * 100
            : 0;
        // Calcular taxa de conversão do mês anterior para comparação
        const totalChamadosMesAnterior = await this.chamadoRepository.count({
            where: {
                createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        const pagamentosMesAnterior = await this.pagamentoRepository.count({
            where: {
                status: pagamento_entity_1.StatusPagamento.APROVADO,
                createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        const conversaoMesAnterior = totalChamadosMesAnterior > 0
            ? (pagamentosMesAnterior / totalChamadosMesAnterior) * 100
            : 0;
        // Ticket médio (média de valores de pagamentos confirmados)
        const pagamentosConfirmados = await this.pagamentoRepository.find({
            where: {
                status: pagamento_entity_1.StatusPagamento.APROVADO,
                createdAt: new Date(thirtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        const ticketMedio = pagamentosConfirmados.length > 0
            ? pagamentosConfirmados.reduce((sum, p) => sum + Number(p.valor), 0) / pagamentosConfirmados.length
            : 0;
        const pagamentosConfirmadosMesAnterior = await this.pagamentoRepository.find({
            where: {
                status: pagamento_entity_1.StatusPagamento.APROVADO,
                createdAt: new Date(sixtyDaysAgo.toISOString().split('T')[0]),
            },
        });
        const ticketMesAnterior = pagamentosConfirmadosMesAnterior.length > 0
            ? pagamentosConfirmadosMesAnterior.reduce((sum, p) => sum + Number(p.valor), 0) / pagamentosConfirmadosMesAnterior.length
            : 0;
        // Funil de conversão
        const triados = await this.chamadoRepository.count({
            where: [
                { status: chamado_entity_1.ChamadoStatus.TRIADO },
                { status: chamado_entity_1.ChamadoStatus.AGENDADO },
                { status: chamado_entity_1.ChamadoStatus.CONCLUIDO },
            ],
        });
        const orcamentosEnviados = await this.orcamentoRepository.count();
        const funil = [
            { etapa: 'Leads', valor: totalChamados },
            { etapa: 'Triagem concluída', valor: triados },
            { etapa: 'Orçamentos enviados', valor: orcamentosEnviados },
            { etapa: 'Pagamentos', valor: pagamentosEfetivados },
        ];
        // NPS - Por ora, retornar dados mockados (implementar avaliações depois)
        const nps = {
            promotores: 62,
            neutros: 24,
            detratores: 14,
            score: 48, // (promotores - detratores)
        };
        // Tendências (variações percentuais)
        const tendencias = {
            chamadosAbertosVariacao: chamadosAbertos - chamadosEmAtendimento,
            concluidosVariacao: concluidosMesAnterior > 0
                ? ((chamadosConcluidos - concluidosMesAnterior) / concluidosMesAnterior) * 100
                : 0,
            conversaoVariacao: conversaoMesAnterior > 0
                ? taxaConversao - conversaoMesAnterior
                : 0,
            ticketVariacao: ticketMesAnterior > 0
                ? ticketMedio - ticketMesAnterior
                : 0,
        };
        return {
            chamadosAbertos,
            chamadosEmAtendimento,
            chamadosConcluidos,
            taxaConversao,
            ticketMedio,
            funil,
            nps,
            tendencias,
        };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chamado_entity_1.Chamado)),
    __param(1, (0, typeorm_1.InjectRepository)(orcamento_entity_1.Orcamento)),
    __param(2, (0, typeorm_1.InjectRepository)(pagamento_entity_1.Pagamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetricsService);
