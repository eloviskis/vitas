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
exports.LgpdService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/entities/user.entity");
const chamado_entity_1 = require("../chamado/entities/chamado.entity");
const pagamento_entity_1 = require("../pagamento/entities/pagamento.entity");
const avaliacao_entity_1 = require("../avaliacao/entities/avaliacao.entity");
let LgpdService = class LgpdService {
    constructor(userRepository, chamadoRepository, pagamentoRepository, avaliacaoRepository) {
        this.userRepository = userRepository;
        this.chamadoRepository = chamadoRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }
    /**
     * Exporta todos os dados pessoais do usuário (LGPD Art. 18, II)
     */
    async exportUserData(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        // Buscar todos os chamados do usuário
        const chamados = await this.chamadoRepository.find({
            where: { cliente: { id: userId } },
            relations: ['triagem', 'agendamento', 'fotos'],
        });
        // Buscar todos os pagamentos relacionados aos chamados
        const pagamentos = await this.pagamentoRepository.find({
            where: { orcamento: { chamado: { cliente: { id: userId } } } },
            relations: ['orcamento'],
        });
        // Buscar todas as avaliações do usuário
        const avaliacoes = await this.avaliacaoRepository.find({
            where: { cliente: { id: userId } },
        });
        // Remover dados sensíveis antes de exportar
        const { password, fcmToken, ...userData } = user;
        return {
            usuario: userData,
            chamados: chamados.map(chamado => ({
                id: chamado.id,
                descricao: chamado.descricao,
                endereco: chamado.endereco,
                cidade: chamado.cidade,
                estado: chamado.estado,
                status: chamado.status,
                createdAt: chamado.createdAt,
                updatedAt: chamado.updatedAt,
            })),
            pagamentos: pagamentos.map(pagamento => ({
                id: pagamento.id,
                valor: pagamento.valor,
                metodoPagamento: pagamento.metodoPagamento,
                status: pagamento.status,
                createdAt: pagamento.createdAt,
            })),
            avaliacoes: avaliacoes.map(avaliacao => ({
                id: avaliacao.id,
                nota: avaliacao.nota,
                comentario: avaliacao.comentario,
                createdAt: avaliacao.createdAt,
            })),
            dataExportacao: new Date(),
        };
    }
    /**
     * Solicita exclusão de conta (LGPD Art. 18, VI)
     * A exclusão real ocorrerá após 30 dias (período de retenção legal)
     */
    async requestDeletion(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        // Marcar usuário como inativo e definir data de exclusão
        const dataExclusao = new Date();
        dataExclusao.setDate(dataExclusao.getDate() + 30); // 30 dias a partir de hoje
        user.ativo = false;
        // Adicionar campo deletionRequestedAt se existir na entidade
        // user.deletionRequestedAt = new Date();
        await this.userRepository.save(user);
        return {
            message: 'Sua solicitação de exclusão foi registrada e será processada em até 30 dias',
            dataExclusao,
        };
    }
    /**
     * Obter status de consentimento do usuário
     */
    async getConsent(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        // Por enquanto, retornar valores padrão
        // No futuro, adicionar campos específicos na entidade User
        return {
            termsAccepted: true, // Assume que aceitou ao se cadastrar
            privacyPolicyAccepted: true,
            marketingConsent: false, // Padrão: não consentiu marketing
        };
    }
    /**
     * Anonimizar dados do usuário após período de retenção
     * (Para ser executado por um cron job)
     */
    async anonymizeUser(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return;
        }
        // Anonimizar dados pessoais
        user.email = `deleted_${user.id}@anonymized.com`;
        user.nome = 'Usuário Excluído';
        user.password = 'ANONYMIZED';
        user.fcmToken = null;
        user.ativo = false;
        await this.userRepository.save(user);
        // Anonimizar chamados relacionados
        const chamados = await this.chamadoRepository.find({
            where: { cliente: { id: userId } },
        });
        for (const chamado of chamados) {
            chamado.endereco = 'ENDEREÇO ANONIMIZADO';
            chamado.descricao = 'Descrição removida por solicitação do usuário';
            await this.chamadoRepository.save(chamado);
        }
    }
};
exports.LgpdService = LgpdService;
exports.LgpdService = LgpdService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(chamado_entity_1.Chamado)),
    __param(2, (0, typeorm_1.InjectRepository)(pagamento_entity_1.Pagamento)),
    __param(3, (0, typeorm_1.InjectRepository)(avaliacao_entity_1.Avaliacao)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LgpdService);
