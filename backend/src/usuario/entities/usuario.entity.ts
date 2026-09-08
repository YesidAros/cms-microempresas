import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  nombre!: string;

  @Column({ default: 'admin' })
  rol!: string;

  @ManyToOne(() => Empresa)
  empresa!: Empresa;

  @CreateDateColumn()
  fechaCreacion!: Date;
}