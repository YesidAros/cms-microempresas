import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Servicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ nullable: true })
  imagenUrl!: string;

  @Column({ type: 'int', nullable: true })
  orden!: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.servicios)
  empresa!: Empresa;
}