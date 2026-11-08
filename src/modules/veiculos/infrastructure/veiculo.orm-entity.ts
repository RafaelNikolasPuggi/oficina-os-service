import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('veiculos')
export class VeiculoOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 7 })
  placa: string;

  @Column({ type: 'varchar', length: 60 })
  marca: string;

  @Column({ type: 'varchar', length: 60 })
  modelo: string;

  @Column({ type: 'int' })
  ano: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
