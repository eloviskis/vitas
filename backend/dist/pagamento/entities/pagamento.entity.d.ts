import { Orcamento } from '../../orcamento/entities/orcamento.entity';
import { Profissional } from '../../profissional/entities/profissional.entity';
export declare enum StatusPagamento {
    PENDENTE = "PENDENTE",
    PROCESSANDO = "PROCESSANDO",
    APROVADO = "APROVADO",
    RECUSADO = "RECUSADO",
    CANCELADO = "CANCELADO",
    ESTORNADO = "ESTORNADO"
}
export declare enum MetodoPagamento {
    PIX = "PIX",
    CREDITO = "CREDITO",
    DEBITO = "DEBITO",
    BOLETO = "BOLETO"
}
export declare class Pagamento {
    id: number;
    orcamento: Orcamento;
    orcamentoId: string;
    profissional: Profissional;
    profissionalId: number;
    valorTotal: number;
    get valor(): number;
    valorProfissional: number;
    valorPlataforma: number;
    status: StatusPagamento;
    metodoPagamento: MetodoPagamento;
    mercadoPagoId: string;
    mercadoPagoStatus: string;
    pixQrCode: string;
    pixQrCodeData: string;
    pixChave: string;
    dadosTransacao: string;
    linkPagamento: string;
    dataExpiracao: Date;
    dataAprovacao: Date;
    dataCancelamento: Date;
    motivoCancelamento: string;
    criadoEm: Date;
    atualizadoEm: Date;
    get createdAt(): Date;
}
