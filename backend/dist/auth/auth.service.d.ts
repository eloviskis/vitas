import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class AuthService implements OnModuleInit {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: "profissional" | "cliente" | "operador" | "admin";
            nome: string;
        };
    }>;
    register(email: string, password: string, nome: string, role?: 'cliente' | 'profissional' | 'operador' | 'admin'): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: "profissional" | "cliente" | "operador" | "admin";
            nome: string;
        };
    }>;
}
