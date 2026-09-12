import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ default: false })
  autorizado!: boolean;

  @ManyToOne(() => Empresa)
  empresa!: Empresa;

  @CreateDateColumn()
  fechaCreacion!: Date;
}