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
var MercadoPagoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const common_1 = require("@nestjs/common");
let MercadoPagoService = MercadoPagoService_1 = class MercadoPagoService {
    constructor() {
        this.logger = new common_1.Logger(MercadoPagoService_1.name);
        this.sdk = null;
        this.token = process.env.MP_ACCESS_TOKEN;
        if (!this.token)
            return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mercadopago = require('mercadopago');
            this.sdk = new mercadopago.MercadoPago({
                accessToken: this.token,
            });
        }
        catch (err) {
            this.logger.error('Falha ao inicializar SDK Mercado Pago', err);
            this.sdk = null;
        }
    }
    /**
     * Cria um pagamento PIX e retorna dados do QR Code
     */
    async criarPagamentoPix(req) {
        if (!this.sdk) {
            this.logger.warn('MP_ACCESS_TOKEN não configurado ou SDK indisponível');
            return null;
        }
        try {
            const response = await this.sdk.payment.create({
                body: {
                    transaction_amount: req.transaction_amount,
                    description: req.description,
                    payment_method_id: 'pix',
                    payer: req.payer,
                },
            });
            return response?.body ?? null;
        }
        catch (err) {
            this.logger.error('Erro ao criar pagamento PIX no Mercado Pago', err);
            return null;
        }
    }
    /**
     * Obtém detalhes/status de um pagamento pelo ID do MP
     */
    async obterPagamento(id) {
        if (!this.sdk)
            return null;
        try {
            const response = await this.sdk.payment.get({ id });
            return response?.body ?? null;
        }
        catch (err) {
            this.logger.error(`Erro ao consultar pagamento MP id=${id}`, err);
            return null;
        }
    }
    /**
     * Cria um checkout preference para cartão e retorna link de pagamento
     */
    async criarCheckoutLink(params) {
        if (!this.sdk?.preference)
            return null;
        try {
            const response = await this.sdk.preference.create({
                body: {
                    items: [
                        {
                            title: params.title,
                            quantity: params.quantity ?? 1,
                            unit_price: params.amount,
                            currency_id: 'BRL',
                        },
                    ],
                    payment_methods: {
                        excluded_payment_types: [{ id: 'ticket' }],
                    },
                },
            });
            return response?.body?.init_point || response?.body?.sandbox_init_point || null;
        }
        catch (err) {
            this.logger.error('Erro ao criar checkout no Mercado Pago', err);
            return null;
        }
    }
    /**
     * Solicita estorno de um pagamento aprovado
     */
    async estornarPagamento(id) {
        if (!this.sdk?.refund)
            return false;
        try {
            await this.sdk.refund.create({ payment_id: id });
            return true;
        }
        catch (err) {
            this.logger.error(`Erro ao estornar pagamento MP id=${id}`, err);
            return false;
        }
    }
};
exports.MercadoPagoService = MercadoPagoService;
exports.MercadoPagoService = MercadoPagoService = MercadoPagoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MercadoPagoService);
