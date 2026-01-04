import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChamadoHistorico,
  ChamadoHistoricoTipo,
} from '../entities/chamado-historico.entity';
import { CriarHistoricoDto } from '../dtos/historico.dto';

@Injectable()
export class HistoricoService {
  constructor(
    @InjectRepository(ChamadoHistorico)
    private historicoRepository: Repository<ChamadoHistorico>,
  ) {}

  async registrarEvento(
    chamadoId: string,
    dto: CriarHistoricoDto,
  ): Promise<ChamadoHistorico> {
    const evento = this.historicoRepository.create({
      chamadoId,
      ...dto,
    });

    return await this.historicoRepository.save(evento);
  }

  async listarPorChamado(chamadoId: string): Promise<ChamadoHistorico[]> {
    return this.historicoRepository.find({
      where: { chamadoId },
      order: { criadoEm: 'DESC' },
    });
  }

  async registrarStatus(
    chamadoId: string,
    descricao: string,
    metadata?: Record<string, any>,
  ): Promise<ChamadoHistorico> {
    return this.registrarEvento(chamadoId, {
      tipo: ChamadoHistoricoTipo.STATUS,
      descricao,
      metadata,
    });
  }

  async registrarTriagem(
    chamadoId: string,
    descricao: string,
    metadata?: Record<string, any>,
  ): Promise<ChamadoHistorico> {
    return this.registrarEvento(chamadoId, {
      tipo: ChamadoHistoricoTipo.TRIAGEM,
      descricao,
      metadata,
    });
  }

  async registrarAgendamento(
    chamadoId: string,
    descricao: string,
    metadata?: Record<string, any>,
  ): Promise<ChamadoHistorico> {
    return this.registrarEvento(chamadoId, {
      tipo: ChamadoHistoricoTipo.AGENDAMENTO,
      descricao,
      metadata,
    });
  }

  async registrarNota(
    chamadoId: string,
    descricao: string,
    metadata?: Record<string, any>,
  ): Promise<ChamadoHistorico> {
    return this.registrarEvento(chamadoId, {
      tipo: ChamadoHistoricoTipo.NOTA,
      descricao,
      metadata,
    });
  }

  async registrarSistema(
    chamadoId: string,
    descricao: string,
    metadata?: Record<string, any>,
  ): Promise<ChamadoHistorico> {
    return this.registrarEvento(chamadoId, {
      tipo: ChamadoHistoricoTipo.SISTEMA,
      descricao,
      metadata,
    });
  }
}

