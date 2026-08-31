import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  imagenUrl!: string;

  @Column({ type: 'text', nullable: true })
  texto!: string;

  @Column({ nullable: true })
  textoBoton!: string;

  @Column({ nullable: true })
  linkDestino!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'int', nullable: true })
  orden!: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.banners)
  empresa!: Empresa;
}