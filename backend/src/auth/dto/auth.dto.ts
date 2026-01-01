import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nomeCompleto: string;

  @ApiProperty({ example: 'cuidador', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: true })
  @IsBoolean()
  termosAceitos: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: '123456', required: false })
  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nomeCompleto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class Enable2FADto {
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class Verify2FADto {
  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class Disable2FADto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}
