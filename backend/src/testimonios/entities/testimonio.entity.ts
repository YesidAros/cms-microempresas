import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Testimonio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombreAutor!: string;

  @Column({ nullable: true })
  cargoOEmpresa!: string;

  @Column({ type: 'text' })
  texto!: string;

  @Column({ default: false })
  autorizado!: boolean;

  @ManyToOne(() => Empresa)
  empresa!: Empresa;

  @CreateDateColumn()
  fechaCreacion!: Date;
}