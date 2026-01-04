import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chamado, ChamadoStatus } from '../entities/chamado.entity';
import { CriarChamadoDto, AtualizarChamadoDto } from '../dtos/chamado.dto';
import { HistoricoService } from './historico.service';
import { ChamadoHistoricoTipo } from '../entities/chamado-historico.entity';

@Injectable()
export class ChamadoService {
  constructor(
    @InjectRepository(Chamado)
    private chamadoRepository: Repository<Chamado>,
    private historicoService: HistoricoService,
  ) {}

  async criar(dto: CriarChamadoDto): Promise<Chamado> {
    const chamado = this.chamadoRepository.create(dto);
    const resultado = await this.chamadoRepository.save(chamado);

    // Log creation in history
    await this.historicoService.registrarSistema(
      resultado.id,
      'Chamado criado',
      { contexto: dto.contexto, descricao: dto.descricao },
    );

    return resultado;
  }

  async listarPorUsuario(usuarioId: string): Promise<Chamado[]> {
    return this.chamadoRepository.find({
      where: { usuarioId },
      order: { criadoEm: 'DESC' },
      relations: ['historico'],
    });
  }

  async obterPorId(id: string): Promise<Chamado> {
    const chamado = await this.chamadoRepository.findOne({
      where: { id },
      relations: ['historico'],
    });

    if (!chamado) {
      throw new NotFoundException(`Chamado ${id} não encontrado`);
    }

    return chamado;
  }

  async atualizar(id: string, dto: AtualizarChamadoDto): Promise<Chamado> {
    const chamado = await this.obterPorId(id);

    if (dto.status && dto.status !== chamado.status) {
      // Log status change
      await this.historicoService.registrarStatus(
        id,
        `Status alterado para ${dto.status}`,
        { statusAnterior: chamado.status, statusNovo: dto.status },
      );
    }

    Object.assign(chamado, dto);
    return this.chamadoRepository.save(chamado);
  }

  async mudarStatus(
    id: string,
    novoStatus: ChamadoStatus,
    motivo?: string,
  ): Promise<Chamado> {
    const chamado = await this.obterPorId(id);
    const statusAnterior = chamado.status;

    chamado.status = novoStatus;
    const resultado = await this.chamadoRepository.save(chamado);

    // Log status change
    await this.historicoService.registrarStatus(
      id,
      motivo || `Status alterado para ${novoStatus}`,
      { statusAnterior, statusNovo: novoStatus },
    );

    return resultado;
  }

  async deletar(id: string): Promise<void> {
    const chamado = await this.obterPorId(id);
    await this.chamadoRepository.remove(chamado);
  }
}
