import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusOrdemServico } from '../domain/status-ordem-servico.enum';

export interface ItemServicoJson {
  servicoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export interface ItemPecaJson {
  pecaId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

@Entity('ordens_servico')
export class OrdemServicoOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId: string;

  @Index()
  @Column({ type: 'uuid', name: 'veiculo_id' })
  veiculoId: string;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  status: StatusOrdemServico;

  @Column({ type: 'jsonb', name: 'itens_servico', default: () => "'[]'" })
  itensServico: ItemServicoJson[];

  @Column({ type: 'jsonb', name: 'itens_peca', default: () => "'[]'" })
  itensPeca: ItemPecaJson[];

  @Column({
    type: 'varchar',
    length: 1000,
    name: 'observacao_diagnostico',
    nullable: true,
  })
  observacaoDiagnostico: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'valor_total',
    default: 0,
  })
  valorTotal: string;

  @Column({ type: 'timestamptz', name: 'data_recebimento' })
  dataRecebimento: Date;

  @Column({ type: 'timestamptz', name: 'data_diagnostico', nullable: true })
  dataDiagnostico: Date | null;

  @Column({ type: 'timestamptz', name: 'data_aprovacao', nullable: true })
  dataAprovacao: Date | null;

  @Column({ type: 'timestamptz', name: 'data_inicio_execucao', nullable: true })
  dataInicioExecucao: Date | null;

  @Column({ type: 'timestamptz', name: 'data_finalizacao', nullable: true })
  dataFinalizacao: Date | null;

  @Column({ type: 'timestamptz', name: 'data_entrega', nullable: true })
  dataEntrega: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
