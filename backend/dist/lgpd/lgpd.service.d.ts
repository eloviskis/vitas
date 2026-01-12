import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Chamado } from '../chamado/entities/chamado.entity';
import { Pagamento } from '../pagamento/entities/pagamento.entity';
import { Avaliacao } from '../avaliacao/entities/avaliacao.entity';
export interface UserDataExport {
    usuario: Partial<User>;
    chamados: Partial<Chamado>[];
    pagamentos: Partial<Pagamento>[];
    avaliacoes: Partial<Avaliacao>[];
    dataExportacao: Date;
}
export declare class LgpdService {
    private userRepository;
    private chamadoRepository;
    private pagamentoRepository;
    private avaliacaoRepository;
    constructor(userRepository: Repository<User>, chamadoRepository: Repository<Chamado>, pagamentoRepository: Repository<Pagamento>, avaliacaoRepository: Repository<Avaliacao>);
    /**
     * Exporta todos os dados pessoais do usuário (LGPD Art. 18, II)
     */
    exportUserData(userId: string): Promise<UserDataExport>;
    /**
     * Solicita exclusão de conta (LGPD Art. 18, VI)
     * A exclusão real ocorrerá após 30 dias (período de retenção legal)
     */
    requestDeletion(userId: string): Promise<{
        message: string;
        dataExclusao: Date;
    }>;
    /**
     * Obter status de consentimento do usuário
     */
    getConsent(userId: string): Promise<{
        termsAccepted: boolean;
        privacyPolicyAccepted: boolean;
        marketingConsent: boolean;
    }>;
    /**
     * Anonimizar dados do usuário após período de retenção
     * (Para ser executado por um cron job)
     */
    anonymizeUser(userId: string): Promise<void>;
}
