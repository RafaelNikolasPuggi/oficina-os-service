import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('usuarios_admin')
export class UsuarioOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 100, name: 'senha_hash' })
  senhaHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
