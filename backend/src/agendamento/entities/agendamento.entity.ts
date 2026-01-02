import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Chamado } from '../../chamado/entities/chamado.entity';
import { Profissional } from '../../profissional/entities/profissional.entity';

export enum AgendamentoStatus {
  PENDENTE = 'PENDENTE',           // Aguardando confirmação do profissional
  CONFIRMADO = 'CONFIRMADO',       // Profissional confirmou
  EM_ANDAMENTO = 'EM_ANDAMENTO',   // Serviço iniciado
  CONCLUIDO = 'CONCLUIDO',         // Serviço finalizado
  CANCELADO = 'CANCELADO',         // Cancelado por qualquer parte
  REAGENDADO = 'REAGENDADO',       // Reagendado (cria novo registro)
}

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chamado, chamado => chamado.agendamentos)
  chamado: Chamado;

  @Column()
  chamadoId: string;

  @ManyToOne(() => Profissional, profissional => profissional.agendamentos)
  profissional: Profissional;

  @Column()
  profissionalId: string;

  @Column({ type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ type: 'timestamp' })
  dataHoraFim: Date;

  @Column({ type: 'int', default: 120 })
  duracaoEstimadaMinutos: number; // Duração estimada em minutos

  @Column({
    type: 'enum',
    enum: AgendamentoStatus,
    default: AgendamentoStatus.PENDENTE,
  })
  status: AgendamentoStatus;

  @Column({ type: 'text', nullable: true })
  observacoes: string; // Observações do usuário ou profissional

  @Column({ type: 'text', nullable: true })
  motivoCancelamento: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmadoEm: Date; // Quando o profissional confirmou

  @Column({ type: 'timestamp', nullable: true })
  iniciadoEm: Date; // Quando o serviço foi iniciado

  @Column({ type: 'timestamp', nullable: true })
  finalizadoEm: Date; // Quando o serviço foi concluído

  @Column({ type: 'boolean', default: false })
  notificacaoEnviada: boolean; // Se notificação de lembrete foi enviada

  @Column({ type: 'boolean', default: false })
  lembrete24h: boolean; // Lembrete 24h antes enviado

  @Column({ type: 'boolean', default: false })
  lembrete1h: boolean; // Lembrete 1h antes enviado

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
