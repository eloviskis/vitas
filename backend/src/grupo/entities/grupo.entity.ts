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
import { User } from './user.entity';
import { Chamado } from './chamado.entity';

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  foto: string;

  @Column({ type: 'uuid' })
  criadoPorId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor: User;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'grupo_membros',
    joinColumn: { name: 'grupoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
  })
  membros: User[];

  @OneToMany(() => Chamado, (chamado) => chamado.grupo, { cascade: true })
  chamados: Chamado[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @Column({ default: false })
  deletado: boolean;
}
