import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Correo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column('text')
  mensaje!: string;

  @Column({ default: false })
  leido!: boolean;

  @ManyToOne(() => Empresa)
  empresa!: Empresa;

  @CreateDateColumn()
  fechaCreacion!: Date;
}