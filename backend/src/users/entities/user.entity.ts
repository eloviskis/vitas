import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  CUIDADOR = 'cuidador',
  FAMILIAR = 'familiar',
  PROFISSIONAL = 'profissional',
  GESTOR = 'gestor',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'nome_completo' })
  nomeCompleto: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  foto: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUIDADOR,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    name: 'auth_provider',
  })
  authProvider: AuthProvider;

  @Column({ name: 'provider_id', nullable: true })
  providerId: string;

  @Column({ name: 'email_verificado', default: false })
  emailVerificado: boolean;

  @Column({ name: 'token_verificacao_email', nullable: true })
  tokenVerificacaoEmail: string;

  @Column({ name: 'token_reset_senha', nullable: true })
  tokenResetSenha: string;

  @Column({ name: 'token_reset_expira', nullable: true, type: 'timestamp' })
  tokenResetExpira: Date;

  @Column({ name: 'refresh_token', nullable: true, type: 'text' })
  refreshToken: string;

  @Column({ name: 'dois_fatores_ativado', default: false })
  doisFatoresAtivado: boolean;

  @Column({ name: 'dois_fatores_secret', nullable: true })
  doisFatoresSecret: string;

  @Column({ name: 'tentativas_login_falhadas', default: 0 })
  tentativasLoginFalhadas: number;

  @Column({ name: 'bloqueado_ate', nullable: true, type: 'timestamp' })
  bloqueadoAte: Date;

  @Column({ name: 'ultimo_login', nullable: true, type: 'timestamp' })
  ultimoLogin: Date;

  @Column({ name: 'termos_aceitos', default: false })
  termosAceitos: boolean;

  @Column({ name: 'termos_aceitos_em', nullable: true, type: 'timestamp' })
  termosAceitosEm: Date;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @Column({ name: 'deletado_em', nullable: true, type: 'timestamp' })
  deletadoEm: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(attempt, this.password);
  }

  isBlocked(): boolean {
    return this.bloqueadoAte && this.bloqueadoAte > new Date();
  }
}
