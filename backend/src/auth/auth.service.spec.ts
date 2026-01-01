import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, AuthProvider } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    nomeCompleto: 'Test User',
    role: UserRole.CUIDADOR,
    authProvider: AuthProvider.LOCAL,
    emailVerificado: false,
    doisFatoresAtivado: false,
    tentativasLoginFalhadas: 0,
    ativo: true,
    termosAceitos: true,
    comparePassword: jest.fn(),
    isBlocked: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        BCRYPT_SALT_ROUNDS: '10',
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
        TWO_FA_ISSUER: 'VITAS',
        TWO_FA_WINDOW: '2',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        nomeCompleto: 'New User',
        role: UserRole.CUIDADOR,
        termosAceitos: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        nomeCompleto: 'Existing User',
        role: UserRole.CUIDADOR,
        termosAceitos: true,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if terms not accepted', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        nomeCompleto: 'Test User',
        role: UserRole.CUIDADOR,
        termosAceitos: false,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockUser.isBlocked.mockReturnValue(false);
      mockUser.comparePassword.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockUser.isBlocked.mockReturnValue(false);
      mockUser.comparePassword.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is blocked', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockUser.isBlocked.mockReturnValue(true);
      mockUser.bloqueadoAte = new Date(Date.now() + 900000); // 15 min no futuro

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should not reveal if email does not exist', async () => {
      const forgotPasswordDto = { email: 'nonexistent@example.com' };

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetPasswordDto = {
        token: 'valid-token',
        newPassword: 'NewPassword123!',
      };

      const userWithToken = {
        ...mockUser,
        tokenResetSenha: 'valid-token',
        tokenResetExpira: new Date(Date.now() + 3600000),
      };

      mockRepository.findOne.mockResolvedValue(userWithToken);
      mockRepository.save.mockResolvedValue(userWithToken);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException with expired token', async () => {
      const resetPasswordDto = {
        token: 'expired-token',
        newPassword: 'NewPassword123!',
      };

      const userWithExpiredToken = {
        ...mockUser,
        tokenResetSenha: 'expired-token',
        tokenResetExpira: new Date(Date.now() - 3600000), // Expirado
      };

      mockRepository.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateProfileDto = {
        nomeCompleto: 'Updated Name',
        telefone: '11999999999',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, ...updateProfileDto });

      const result = await service.updateProfile(mockUser.id, updateProfileDto);

      expect(result.nomeCompleto).toBe(updateProfileDto.nomeCompleto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
