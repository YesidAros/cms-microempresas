import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Noticia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  resumen!: string;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ nullable: true })
  imagenUrl!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: false })
  publicado!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.noticias)
  empresa!: Empresa;
}