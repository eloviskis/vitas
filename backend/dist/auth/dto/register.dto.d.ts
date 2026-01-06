export declare class RegisterDto {
    email: string;
    password: string;
    nome: string;
    role?: 'cliente' | 'profissional' | 'operador' | 'admin';
}
