import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  tokenHash!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;

  @Column()
  fechaExpiracion!: Date;

  @Column({ default: false })
  usado!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;
}