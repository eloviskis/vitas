import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Chamado } from './chamado.entity';

export enum ProfissionalEspecialidade {
  SAUDE_MENTAL = 'saude_mental',
  ENFERMAGEM = 'enfermagem',
  FISIOTERAPIA = 'fisioterapia',
  NUTRICAO = 'nutricao',
  FONOAUDIOLOGIA = 'fonoaudiologia',
  TERAPIA_OCUPACIONAL = 'terapia_ocupacional',
  PEDAGOGIA = 'pedagogia',
  SERVICO_SOCIAL = 'servico_social',
  OUTRO = 'outro',
}

export enum ProfissionalStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
  PAUSADO = 'pausado',
}

@Entity('profissionais')
export class Profissional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  telefone: string;

  @Column({ nullable: true })
  foto: string;

  @Column({ nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: ProfissionalEspecialidade,
  })
  especialidade: ProfissionalEspecialidade;

  @Column({ nullable: true })
  conselho: string; // Número do conselho profissional

  @Column({ nullable: true })
  cro_crp_crea: string; // Registro profissional

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorHora: number;

  @Column({
    type: 'enum',
    enum: ProfissionalStatus,
    default: ProfissionalStatus.ATIVO,
  })
  status: ProfissionalStatus;

  @Column({ type: 'json', nullable: true })
  horarios: Record<string, any>; // Disponibilidade de agenda

  @Column({ type: 'text', nullable: true })
  descricaoServicos: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number; // Avaliação média (0-5)

  @Column({ default: 0 })
  totalChamados: number;

  @ManyToMany(() => Chamado)
  @JoinTable({
    name: 'profissional_chamados',
    joinColumn: { name: 'profissionalId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chamadoId', referencedColumnName: 'id' },
  })
  chamados: Chamado[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @Column({ default: false })
  deletado: boolean;
}
