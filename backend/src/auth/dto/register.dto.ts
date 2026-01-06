import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsEnum(['cliente', 'profissional', 'operador', 'admin'])
  role?: 'cliente' | 'profissional' | 'operador' | 'admin';
}
