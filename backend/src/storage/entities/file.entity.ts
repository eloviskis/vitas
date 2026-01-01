import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export enum FileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ unique: true })
  filename: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  type: FileType;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    default: FileVisibility.PRIVATE,
  })
  visibility: FileVisibility;

  @Column()
  s3Key: string;

  @Column()
  s3Bucket: string;

  @Column({ nullable: true })
  thumbnailS3Key: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  // Método auxiliar para obter URL
  getUrl(baseUrl: string): string {
    return `${baseUrl}/${this.s3Key}`;
  }
}
