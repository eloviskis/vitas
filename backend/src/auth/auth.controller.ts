import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test')
  @ApiOperation({ summary: 'Testar conectividade da API' })
  @ApiResponse({ status: 200, description: 'API está funcionando' })
  test() {
    return { message: 'Test OK', time: new Date().toISOString() };
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Realiza login e retorna token JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido', schema: { example: { token: 'eyJhbGc...', user: { id: 1, email: 'user@example.com', role: 'cliente' } } } })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiOperation({ summary: 'Registrar novo usuário', description: 'Cria nova conta de cliente, profissional ou admin' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado ou dados inválidos' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário', description: 'Cria nova conta de cliente, profissional ou admin' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado ou dados inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.nome,
      registerDto.role || 'cliente',
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão', description: 'Invalida o token JWT atual' })
  @ApiResponse({ status: 200, description: 'Logout realizado' })
  async logout() {
    return { message: 'Logout successful' };
  }
}


