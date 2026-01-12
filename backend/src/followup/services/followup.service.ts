import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Followup, FollowupStatus } from '../entities/followup.entity';

@Injectable()
export class FollowupService {
  constructor(
    @InjectRepository(Followup)
    private followupRepository: Repository<Followup>,
  ) {}

  async criar(dto: any): Promise<Followup> {
    const followup = new Followup();
    followup.agendamentoId = dto.agendamentoId;
    followup.tipo = dto.tipo;
    followup.mensagem = dto.mensagem;
    followup.status = FollowupStatus.PENDENTE;
    return await this.followupRepository.save(followup);
  }

  async enviar(id: string): Promise<Followup> {
    const followup = await this.obterPorId(id);
    followup.status = FollowupStatus.ENVIADO;
    followup.dataEnvio = new Date();
    return await this.followupRepository.save(followup);
  }

  async responder(id: string, dto: any): Promise<Followup> {
    const followup = await this.obterPorId(id);
    Object.assign(followup, {
      ...dto,
      status: FollowupStatus.RESPONDIDO,
      dataResposta: new Date(),
    });
    return await this.followupRepository.save(followup);
  }

  async obterPorId(id: string): Promise<Followup> {
    const followup = await this.followupRepository.findOne({
      where: { id },
      relations: ['agendamento', 'usuario'],
    });
    if (!followup) {
      throw new NotFoundException(`Followup ${id} não encontrado`);
    }
    return followup;
  }

  async listarPorAgendamento(agendamentoId: string): Promise<Followup[]> {
    return await this.followupRepository.find({
      where: { agendamentoId },
      order: { criadoEm: 'DESC' },
    });
  }

  async listarPendentes(): Promise<Followup[]> {
    return await this.followupRepository.find({
      where: { status: FollowupStatus.PENDENTE },
      relations: ['agendamento', 'usuario'],
      order: { criadoEm: 'DESC' },
    });
  }

  async obterMetricas() {
    const total = await this.followupRepository.count();
    const respondidos = await this.followupRepository.count({
      where: { status: FollowupStatus.RESPONDIDO },
    });
    const avaliacoes = await this.followupRepository
      .createQueryBuilder('f')
      .select('AVG(f.avaliacaoGeral)', 'media')
      .where('f.avaliacaoGeral IS NOT NULL')
      .getRawOne();

    return {
      totalFollowups: total,
      respondidos,
      taxaResposta: total > 0 ? (respondidos / total) * 100 : 0,
      avaliacaoMedia: avaliacoes?.media || 0,
    };
  }
}
