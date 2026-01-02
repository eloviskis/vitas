import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Grupo } from './grupo.entity';
import { Contexto } from './contexto.entity';
import { User } from './user.entity';

export enum ChamadoStatus {
  ABERTO = 'aberto',
  EM_ANDAMENTO = 'em_andamento',
  PAUSADO = 'pausado',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
}

export enum ChamadoPrioridade {
  BAIXA = 'baixa',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

@Entity('chamados')
export class Chamado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'uuid' })
  grupoId: string;

  @ManyToOne(() => Grupo, (grupo) => grupo.chamados)
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;

  @Column({ type: 'uuid', nullable: true })
  contextoId: string;

  @ManyToOne(() => Contexto)
  @JoinColumn({ name: 'contextoId' })
  contexto: Contexto;

  @Column({
    type: 'enum',
    enum: ChamadoStatus,
    default: ChamadoStatus.ABERTO,
  })
  status: ChamadoStatus;

  @Column({
    type: 'enum',
    enum: ChamadoPrioridade,
    default: ChamadoPrioridade.NORMAL,
  })
  prioridade: ChamadoPrioridade;

  @Column({ type: 'uuid' })
  criadoPorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor: User;

  @Column({ type: 'uuid', nullable: true })
  atribuidoParaId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'atribuidoParaId' })
  atribuidoPara: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'chamado_colaboradores',
    joinColumn: { name: 'chamadoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
  })
  colaboradores: User[];

  @Column({ type: 'timestamp', nullable: true })
  dataVencimento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custo: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @Column({ default: false })
  deletado: boolean;
}
