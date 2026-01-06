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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let AuthService = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    // Seed default users on module init (only in development)
    async onModuleInit() {
        const userCount = await this.userRepository.count();
        if (userCount === 0) {
            const defaultUsers = [
                {
                    email: 'cliente@example.com',
                    password: '123456',
                    role: 'cliente',
                    nome: 'João Silva',
                },
                {
                    email: 'operador@example.com',
                    password: '123456',
                    role: 'operador',
                    nome: 'Maria Operadora',
                },
                {
                    email: 'admin@example.com',
                    password: '123456',
                    role: 'admin',
                    nome: 'Admin Sistema',
                },
            ];
            for (const userData of defaultUsers) {
                const user = this.userRepository.create(userData);
                await user.hashPassword();
                await this.userRepository.save(user);
            }
            console.log('✅ Default users created');
        }
    }
    async login(email, password) {
        const user = await this.userRepository.findOne({
            where: { email, ativo: true },
        });
        if (!user || !(await user.comparePassword(password))) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        // Generate real JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const token = await this.jwtService.signAsync(payload);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                nome: user.nome,
            },
        };
    }
    async register(email, password, nome, role = 'cliente') {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('Email já cadastrado');
        }
        // Create new user
        const user = this.userRepository.create({
            email,
            password,
            nome,
            role,
        });
        await user.hashPassword();
        const savedUser = await this.userRepository.save(user);
        // Generate JWT token
        const payload = {
            sub: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
        };
        const token = await this.jwtService.signAsync(payload);
        return {
            token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
                nome: savedUser.nome,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
