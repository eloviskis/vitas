import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    test(): {
        message: string;
        time: string;
    };
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: "cliente" | "profissional" | "operador" | "admin";
            nome: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: "cliente" | "profissional" | "operador" | "admin";
            nome: string;
        };
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
