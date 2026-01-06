export declare class User {
    id: string;
    email: string;
    password: string;
    nome: string;
    role: 'cliente' | 'profissional' | 'operador' | 'admin';
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    comparePassword(plainPassword: string): Promise<boolean>;
}
