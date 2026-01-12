interface PixPaymentRequest {
    transaction_amount: number;
    description: string;
    payer?: {
        email?: string;
        identification?: {
            type: string;
            number: string;
        };
    };
}
interface PixPaymentResponse {
    id: string;
    status: string;
    point_of_interaction?: {
        transaction_data?: {
            qr_code?: string;
            qr_code_base64?: string;
        };
    };
}
export declare class MercadoPagoService {
    private readonly logger;
    private readonly sdk;
    private readonly token;
    constructor();
    /**
     * Cria um pagamento PIX e retorna dados do QR Code
     */
    criarPagamentoPix(req: PixPaymentRequest): Promise<PixPaymentResponse | null>;
    /**
     * Obtém detalhes/status de um pagamento pelo ID do MP
     */
    obterPagamento(id: string): Promise<PixPaymentResponse | null>;
    /**
     * Cria um checkout preference para cartão e retorna link de pagamento
     */
    criarCheckoutLink(params: {
        title: string;
        amount: number;
        quantity?: number;
    }): Promise<string | null>;
    /**
     * Solicita estorno de um pagamento aprovado
     */
    estornarPagamento(id: string | number): Promise<boolean>;
}
export {};
