import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Enum,
} from 'typeorm';
import { ChamadoHistorico } from './chamado-historico.entity';

export enum ChamadoStatus {
  ABERTO = 'ABERTO',
  TRIADO = 'TRIADO',
  AGENDADO = 'AGENDADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

@Entity({ name: 'chamados' })
export class Chamado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({ name: 'contexto' })
  contexto: string; // Casa, Vida Digital, Familia, Idosos, Transicoes

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'enum', enum: ChamadoStatus, default: ChamadoStatus.ABERTO })
  status: ChamadoStatus;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadados?: Record<string, any>;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  // Relations
  @OneToMany(
    () => ChamadoHistorico,
    (historico) => historico.chamado,
    { cascade: true, eager: false },
  )
  historico?: ChamadoHistorico[];
}
