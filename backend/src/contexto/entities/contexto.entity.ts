import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContextoTipo {
  CASA = 'casa',
  VIDA_DIGITAL = 'vida_digital',
  IDOSO = 'idoso',
  TRANSICAO = 'transicao',
}

@Entity('contextos')
export class Contexto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContextoTipo,
  })
  tipo: ContextoTipo;

  @Column()
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  icone: string;

  @Column({ nullable: true })
  cor: string;

  @Column({ type: 'json', nullable: true })
  configuracao: Record<string, any>;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
