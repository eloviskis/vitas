import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChamadoService } from '../services/chamado.service';
import {
  CriarChamadoDto,
  AtualizarChamadoDto,
  ChamadoResponseDto,
} from '../dtos/chamado.dto';

@ApiTags('Chamados')
@Controller('chamados')
export class ChamadoController {
  constructor(private readonly chamadoService: ChamadoService) {}

  @Post()
  async criar(@Body() dto: CriarChamadoDto): Promise<ChamadoResponseDto> {
    const chamado = await this.chamadoService.criar(dto);
    return this.mapToResponse(chamado);
  }

  @Get(':usuarioId')
  async listarPorUsuario(
    @Param('usuarioId') usuarioId: string,
  ): Promise<ChamadoResponseDto[]> {
    const chamados = await this.chamadoService.listarPorUsuario(usuarioId);
    return chamados.map((c) => this.mapToResponse(c));
  }

  @Get(':id')
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
