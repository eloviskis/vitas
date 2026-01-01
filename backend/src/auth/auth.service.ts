import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, AuthProvider } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { randomBytes } from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, nomeCompleto, role, termosAceitos } = registerDto;

    // Verificar se email já existe
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    if (!termosAceitos) {
      throw new BadRequestException('Você deve aceitar os termos de uso e política de privacidade');
    }

    // Criar usuário
    const user = this.usersRepository.create({
      email,
      password,
      nomeCompleto,
      role,
      termosAceitos,
      termosAceitosEm: new Date(),
      authProvider: AuthProvider.LOCAL,
      tokenVerificacaoEmail: randomBytes(32).toString('hex'),
    });

    await this.usersRepository.save(user);

    // TODO: Enviar email de verificação
    // await this.emailService.sendVerificationEmail(user.email, user.tokenVerificacaoEmail);

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.save(user);

    delete user.password;
    delete user.refreshToken;

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, twoFactorCode } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se está bloqueado
    if (user.isBlocked()) {
      const minutesLeft = Math.ceil((user.bloqueadoAte.getTime() - Date.now()) / 1000 / 60);
      throw new UnauthorizedException(`Conta bloqueada. Tente novamente em ${minutesLeft} minutos`);
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar 2FA se ativado
    if (user.doisFatoresAtivado) {
      if (!twoFactorCode) {
        throw new UnauthorizedException('Código de autenticação de dois fatores necessário');
      }

      const isCodeValid = speakeasy.totp.verify({
        secret: user.doisFatoresSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: this.configService.get('TWO_FA_WINDOW', 2),
      });

      if (!isCodeValid) {
        throw new UnauthorizedException('Código de autenticação inválido');
      }
    }

    // Reset tentativas falhadas
    user.tentativasLoginFalhadas = 0;
    user.bloqueadoAte = null;
    user.ultimoLogin = new Date();

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.save(user);

    delete user.password;
    delete user.refreshToken;
    delete user.doisFatoresSecret;

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token inválido');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Token inválido');
      }

      const tokens = await this.generateTokens(user);

      user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersRepository.save(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Não revelar se email existe ou não (segurança)
      return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' };
    }

    // Gerar token de reset
    const resetToken = randomBytes(32).toString('hex');
    user.tokenResetSenha = resetToken;
    user.tokenResetExpira = new Date(Date.now() + 3600000); // 1 hora

    await this.usersRepository.save(user);

    // TODO: Enviar email com link de reset
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`Reset token for ${email}: ${resetToken}`); // DEV ONLY

    return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { tokenResetSenha: token },
    });

    if (!user || !user.tokenResetExpira || user.tokenResetExpira < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    user.password = newPassword;
    user.tokenResetSenha = null;
    user.tokenResetExpira = null;
    user.refreshToken = null; // Invalidar sessões antigas

    await this.usersRepository.save(user);

    // TODO: Enviar email de confirmação
    // await this.emailService.sendPasswordChangedEmail(user.email);

    return { message: 'Senha redefinida com sucesso' };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersRepository.update(userId, { refreshToken: null });
    return { message: 'Logout realizado com sucesso' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    Object.assign(user, updateProfileDto);
    await this.usersRepository.save(user);

    delete user.password;
    delete user.refreshToken;
    delete user.doisFatoresSecret;

    return user;
  }

  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('TWO_FA_ISSUER', 'VITAS')} (${user.email})`,
      length: 32,
    });

    user.doisFatoresSecret = secret.base32;
    await this.usersRepository.save(user);

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verify2FA(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user || !user.doisFatoresSecret) {
      throw new BadRequestException('2FA não configurado');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.doisFatoresSecret,
      encoding: 'base32',
      token: code,
      window: this.configService.get('TWO_FA_WINDOW', 2),
    });

    if (!isValid) {
      throw new BadRequestException('Código inválido');
    }

    user.doisFatoresAtivado = true;
    await this.usersRepository.save(user);

    return { message: '2FA ativado com sucesso' };
  }

  async disable2FA(userId: string, password: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    if (user.doisFatoresAtivado && user.doisFatoresSecret) {
      const isCodeValid = speakeasy.totp.verify({
        secret: user.doisFatoresSecret,
        encoding: 'base32',
        token: code,
        window: this.configService.get('TWO_FA_WINDOW', 2),
      });

      if (!isCodeValid) {
        throw new BadRequestException('Código inválido');
      }
    }

    user.doisFatoresAtivado = false;
    user.doisFatoresSecret = null;
    await this.usersRepository.save(user);

    return { message: '2FA desativado com sucesso' };
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.tentativasLoginFalhadas += 1;

    if (user.tentativasLoginFalhadas >= 5) {
      user.bloqueadoAte = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      user.tentativasLoginFalhadas = 0;
    }

    await this.usersRepository.save(user);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
