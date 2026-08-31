import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  mision!: string;

  @Column({ type: 'text', nullable: true })
  vision!: string;

  @Column({ type: 'text', nullable: true })
  sobreNosotros!: string;

  @Column({ type: 'text', nullable: true })
  porQueElegirnos!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ nullable: true })
  telefonoContacto!: string;

  @Column({ nullable: true })
  emailContacto!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ nullable: true })
  whatsappNumero!: string;

  @Column({ nullable: true })
  facebookUrl!: string;

  @Column({ nullable: true })
  instagramUrl!: string;

  @Column({ nullable: true })
  youtubeUrl!: string;
}