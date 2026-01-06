import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChamadoService } from '../services/chamado.service';
import {
  CriarChamadoDto,
  AtualizarChamadoDto,
  ChamadoResponseDto,
} from '../dtos/chamado.dto';

@ApiTags('Chamados')
@ApiBearerAuth()
@Controller('chamados')
@UseGuards(JwtAuthGuard)
export class ChamadoController {
  constructor(private readonly chamadoService: ChamadoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo chamado', description: 'Cria um novo chamado de manutenção' })
  @ApiResponse({ status: 201, description: 'Chamado criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async criar(@Body() dto: CriarChamadoDto): Promise<ChamadoResponseDto> {
    const chamado = await this.chamadoService.criar(dto);
    return this.mapToResponse(chamado);
  }

  @Get('all')
  @ApiOperation({ summary: 'Listar todos os chamados' })
  @ApiResponse({ status: 200, description: 'Lista de chamados retornada' })
  async listarTodos(): Promise<ChamadoResponseDto[]> {
    const chamados = await this.chamadoService.listarTodos();
    return chamados.map((c) => this.mapToResponse(c));
  }

  @Get('usuario/:usuarioId')
  async listarPorUsuario(
    @Param('usuarioId') usuarioId: string,
  ): Promise<ChamadoResponseDto[]> {
    const chamados = await this.chamadoService.listarPorUsuario(usuarioId);
    return chamados.map((c) => this.mapToResponse(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter chamado por ID' })
  @ApiResponse({ status: 200, description: 'Chamado encontrado' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado' })
  async obter(@Param('id') id: string): Promise<ChamadoResponseDto> {
    const chamado = await this.chamadoService.obterPorId(id);
    return this.mapToResponse(chamado);
  }

  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarChamadoDto,
  ): Promise<ChamadoResponseDto> {
    const chamado = await this.chamadoService.atualizar(id, dto);
    return this.mapToResponse(chamado);
  }

  @Delete(':id')
  async deletar(@Param('id') id: string): Promise<void> {
    await this.chamadoService.deletar(id);
  }

  private mapToResponse(chamado: any): ChamadoResponseDto {
    return {
      id: chamado.id,
      usuarioId: chamado.usuarioId,
      contexto: chamado.contexto,
      descricao: chamado.descricao,
      status: chamado.status,
      observacoes: chamado.observacoes,
      criadoEm: chamado.criadoEm,
      atualizadoEm: chamado.atualizadoEm,
    };
  }
}
