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
exports.RelatorioFinanceiroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pagamento_entity_1 = require("../entities/pagamento.entity");
let RelatorioFinanceiroService = class RelatorioFinanceiroService {
    constructor(pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }
    async obterResumoFinanceiro(dataInicio, dataFim) {
        const pagamentos = await this.pagamentoRepository.find({
            where: {
                criadoEm: (0, typeorm_2.Between)(dataInicio, dataFim),
                status: pagamento_entity_1.StatusPagamento.APROVADO,
            },
            relations: ['orcamento', 'orcamento.profissional'],
        });
        const totalBruto = pagamentos.reduce((sum, p) => sum + p.valor, 0);
        const comissaoPlataforma = pagamentos.reduce((sum, p) => sum + p.valorPlataforma, 0);
        const valorProfissionais = pagamentos.reduce((sum, p) => sum + p.valorProfissional, 0);
        const porMetodo = pagamentos.reduce((acc, p) => {
            acc[p.metodoPagamento] = (acc[p.metodoPagamento] || 0) + p.valor;
            return acc;
        }, {});
        const topProfissionais = this.calcularTopProfissionais(pagamentos);
        return {
            periodo: { inicio: dataInicio, fim: dataFim },
            resumo: {
                totalTransacoes: pagamentos.length,
                valorBruto: totalBruto,
                comissaoPlataforma,
                valorLiquido: totalBruto - comissaoPlataforma,
                valorRepasses: valorProfissionais,
            },
            porMetodo,
            topProfissionais,
        };
    }
    calcularTopProfissionais(pagamentos) {
        const profissionaisMap = new Map();
        pagamentos.forEach(p => {
            if (p.orcamento?.profissional) {
                const prof = p.orcamento.profissional;
                if (!profissionaisMap.has(prof.id)) {
                    profissionaisMap.set(prof.id, {
                        id: prof.id,
                        nome: prof.nome,
                        totalRecebido: 0,
                        totalTransacoes: 0,
                    });
                }
                const data = profissionaisMap.get(prof.id);
                data.totalRecebido += p.valorProfissional;
                data.totalTransacoes += 1;
            }
        });
        return Array.from(profissionaisMap.values())
            .sort((a, b) => b.totalRecebido - a.totalRecebido)
            .slice(0, 10);
    }
    async obterMetricasDiarias(dataInicio, dataFim) {
        const pagamentos = await this.pagamentoRepository.find({
            where: {
                criadoEm: (0, typeorm_2.Between)(dataInicio, dataFim),
                status: pagamento_entity_1.StatusPagamento.APROVADO,
            },
        });
        const porDia = pagamentos.reduce((acc, p) => {
            const dia = p.criadoEm.toISOString().split('T')[0];
            if (!acc[dia]) {
                acc[dia] = { data: dia, total: 0, quantidade: 0 };
            }
            acc[dia].total += p.valor;
            acc[dia].quantidade += 1;
            return acc;
        }, {});
        return Object.values(porDia).sort((a, b) => a.data.localeCompare(b.data));
    }
    async obterTaxaConversao(dataInicio, dataFim) {
        const total = await this.pagamentoRepository.count({
            where: { criadoEm: (0, typeorm_2.Between)(dataInicio, dataFim) },
        });
        const aprovados = await this.pagamentoRepository.count({
            where: {
                criadoEm: (0, typeorm_2.Between)(dataInicio, dataFim),
                status: pagamento_entity_1.StatusPagamento.APROVADO,
            },
        });
        return {
            total,
            aprovados,
            taxa: total > 0 ? (aprovados / total) * 100 : 0,
        };
    }
};
exports.RelatorioFinanceiroService = RelatorioFinanceiroService;
exports.RelatorioFinanceiroService = RelatorioFinanceiroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pagamento_entity_1.Pagamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RelatorioFinanceiroService);
