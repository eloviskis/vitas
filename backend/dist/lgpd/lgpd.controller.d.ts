import { LgpdService } from './lgpd.service';
export declare class LgpdController {
    private lgpdService;
    constructor(lgpdService: LgpdService);
    exportMyData(req: any): Promise<import("./lgpd.service").UserDataExport>;
    requestAccountDeletion(req: any): Promise<{
        message: string;
        dataExclusao: Date;
    }>;
    getConsent(req: any): Promise<{
        termsAccepted: boolean;
        privacyPolicyAccepted: boolean;
        marketingConsent: boolean;
    }>;
}
