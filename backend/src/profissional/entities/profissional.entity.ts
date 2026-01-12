import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';

export enum ProfissionalStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  SUSPENSO = 'SUSPENSO',
  BLOQUEADO = 'BLOQUEADO',
}

@Index('idx_profissional_contexto', ['contextos'])
@Index('idx_profissional_status', ['status'])
@Entity({ name: 'profissionais' })
export class Profissional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'simple-array' })
  contextos: string[]; // Casa, Vida Digital, etc.

  @Column({ type: 'simple-array' })
  categorias: string[]; // Encanador, Eletricista, etc.

  @Column({ type: 'varchar', length: 50, default: ProfissionalStatus.ATIVO })
  status: ProfissionalStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  score: number; // 0-5.00 rating

  @Column({ type: 'integer', default: 0 })
  totalServiços: number;

  @Column({ type: 'integer', default: 0 })
  serviçosConcluídos: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  taxaSatisfação: number;

  @Column({ type: 'text', nullable: true })
  areasDiasponibilidade?: Record<string, any>;

  @Column({ nullable: true })
  cep?: string;

  @Column({ nullable: true })
  cidade?: string;

  @Column({ nullable: true })
  estado?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDENTE' })
  statusVerificacao: 'PENDENTE' | 'APROVADO' | 'REJEITADO';

  @Column({ type: 'text', nullable: true })
  documentos?: string; // JSON com paths dos documentos

  @Column({ nullable: true })
  verificadoPor?: string;

  @Column({ type: 'timestamp', nullable: true })
  dataVerificacao?: Date;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  // Relations (lazy loading to avoid circular dependency)
  triagensPendentes?: any[];
}
