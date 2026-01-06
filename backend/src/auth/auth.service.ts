import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Seed default users on module init (only in development)
  async onModuleInit() {
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      const defaultUsers = [
        {
          email: 'cliente@example.com',
          password: '123456',
          role: 'cliente' as const,
          nome: 'João Silva',
        },
        {
          email: 'operador@example.com',
          password: '123456',
          role: 'operador' as const,
          nome: 'Maria Operadora',
        },
        {
          email: 'admin@example.com',
          password: '123456',
          role: 'admin' as const,
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

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email, ativo: true },
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Credenciais inválidas');
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

  async register(email: string, password: string, nome: string, role: 'cliente' | 'profissional' | 'operador' | 'admin' = 'cliente') {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email já cadastrado');
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
}
