import { Entity } from '../../../shared/domain/entity.base';
import { InvalidStatusTransitionException } from '../../../shared/domain/exceptions';
import {
  criarItemPeca,
  criarItemServico,
  ItemPecaOS,
  ItemServicoOS,
  subtotalPeca,
  subtotalServico,
} from './item-ordem-servico.vo';
import {
  podeTransicionar,
  StatusOrdemServico,
} from './status-ordem-servico.enum';

export interface AbrirOrdemServicoProps {
  id: string;
  clienteId: string;
  veiculoId: string;
  itensServico: ItemServicoOS[];
  itensPeca: ItemPecaOS[];
}

export interface OrdemServicoSnapshot {
  id: string;
  clienteId: string;
  veiculoId: string;
  status: StatusOrdemServico;
  itensServico: ItemServicoOS[];
  itensPeca: ItemPecaOS[];
  observacaoDiagnostico: string | null;
  valorTotal: number;
  dataRecebimento: Date;
  dataDiagnostico: Date | null;
  dataAprovacao: Date | null;
  dataInicioExecucao: Date | null;
  dataFinalizacao: Date | null;
  dataEntrega: Date | null;
}

/**
 * Agregado raiz central do domínio. Concentra a máquina de estados da OS e as
 * regras de cálculo de orçamento — nenhuma transição de status acontece fora
 * daqui, o que garante que a OS nunca fique em um estado inconsistente
 * independentemente de qual camada (HTTP, job, etc.) a acione.
 */
export class OrdemServico extends Entity {
  private readonly clienteId: string;
  private readonly veiculoId: string;
  private status: StatusOrdemServico;
  private itensServico: ItemServicoOS[];
  private itensPeca: ItemPecaOS[];
  private observacaoDiagnostico: string | null;
  private valorTotal: number;
  private readonly dataRecebimento: Date;
  private dataDiagnostico: Date | null;
  private dataAprovacao: Date | null;
  private dataInicioExecucao: Date | null;
  private dataFinalizacao: Date | null;
  private dataEntrega: Date | null;

  private constructor(
    id: string,
    clienteId: string,
    veiculoId: string,
    dataRecebimento: Date,
  ) {
    super(id);
    this.clienteId = clienteId;
    this.veiculoId = veiculoId;
    this.dataRecebimento = dataRecebimento;
    this.dataDiagnostico = null;
    this.dataAprovacao = null;
    this.dataInicioExecucao = null;
    this.dataFinalizacao = null;
    this.dataEntrega = null;
  }

  static abrir(props: AbrirOrdemServicoProps): OrdemServico {
    const os = new OrdemServico(
      props.id,
      props.clienteId,
      props.veiculoId,
      new Date(),
    );
    os.status = StatusOrdemServico.RECEBIDA;
    os.itensServico = props.itensServico.map(criarItemServico);
    os.itensPeca = props.itensPeca.map(criarItemPeca);
    os.observacaoDiagnostico = null;
    os.recalcularValorTotal();
    return os;
  }

  static restaurar(snapshot: OrdemServicoSnapshot): OrdemServico {
    const os = new OrdemServico(
      snapshot.id,
      snapshot.clienteId,
      snapshot.veiculoId,
      snapshot.dataRecebimento,
    );
    os.status = snapshot.status;
    os.itensServico = snapshot.itensServico;
    os.itensPeca = snapshot.itensPeca;
    os.observacaoDiagnostico = snapshot.observacaoDiagnostico;
    os.valorTotal = snapshot.valorTotal;
    os.dataDiagnostico = snapshot.dataDiagnostico;
    os.dataAprovacao = snapshot.dataAprovacao;
    os.dataInicioExecucao = snapshot.dataInicioExecucao;
    os.dataFinalizacao = snapshot.dataFinalizacao;
    os.dataEntrega = snapshot.dataEntrega;
    return os;
  }

  private transicionarPara(novoStatus: StatusOrdemServico): void {
    if (!podeTransicionar(this.status, novoStatus)) {
      throw new InvalidStatusTransitionException(this.status, novoStatus);
    }
    this.status = novoStatus;
  }

  iniciarDiagnostico(): void {
    this.transicionarPara(StatusOrdemServico.EM_DIAGNOSTICO);
    this.dataDiagnostico = new Date();
  }

  /** Registra o resultado do diagnóstico, gera o orçamento e o envia para aprovação. */
  registrarDiagnostico(props: {
    observacao: string;
    itensServicoAdicionais: ItemServicoOS[];
    itensPecaAdicionais: ItemPecaOS[];
  }): void {
    this.transicionarPara(StatusOrdemServico.AGUARDANDO_APROVACAO);
    this.observacaoDiagnostico = props.observacao;
    this.itensServico = [
      ...this.itensServico,
      ...props.itensServicoAdicionais.map(criarItemServico),
    ];
    this.itensPeca = [
      ...this.itensPeca,
      ...props.itensPecaAdicionais.map(criarItemPeca),
    ];
    this.recalcularValorTotal();
  }

  aprovarOrcamento(): void {
    this.transicionarPara(StatusOrdemServico.EM_EXECUCAO);
    this.dataAprovacao = new Date();
    this.dataInicioExecucao = new Date();
  }

  recusarOrcamento(): void {
    this.transicionarPara(StatusOrdemServico.RECUSADA);
    this.dataAprovacao = new Date();
  }

  finalizar(): void {
    this.transicionarPara(StatusOrdemServico.FINALIZADA);
    this.dataFinalizacao = new Date();
  }

  entregar(): void {
    this.transicionarPara(StatusOrdemServico.ENTREGUE);
    this.dataEntrega = new Date();
  }

  private recalcularValorTotal(): void {
    const totalServicos = this.itensServico.reduce(
      (acc, item) => acc + subtotalServico(item),
      0,
    );
    const totalPecas = this.itensPeca.reduce(
      (acc, item) => acc + subtotalPeca(item),
      0,
    );
    this.valorTotal = Math.round((totalServicos + totalPecas) * 100) / 100;
  }

  /** Tempo de execução em minutos (null enquanto a OS não estiver finalizada). */
  tempoExecucaoMinutos(): number | null {
    if (!this.dataInicioExecucao || !this.dataFinalizacao) return null;
    return Math.round(
      (this.dataFinalizacao.getTime() - this.dataInicioExecucao.getTime()) /
        60000,
    );
  }

  getClienteId(): string {
    return this.clienteId;
  }

  getVeiculoId(): string {
    return this.veiculoId;
  }

  getStatus(): StatusOrdemServico {
    return this.status;
  }

  getItensServico(): readonly ItemServicoOS[] {
    return this.itensServico;
  }

  getItensPeca(): readonly ItemPecaOS[] {
    return this.itensPeca;
  }

  getObservacaoDiagnostico(): string | null {
    return this.observacaoDiagnostico;
  }

  getValorTotal(): number {
    return this.valorTotal;
  }

  getDataRecebimento(): Date {
    return this.dataRecebimento;
  }

  getDataDiagnostico(): Date | null {
    return this.dataDiagnostico;
  }

  getDataAprovacao(): Date | null {
    return this.dataAprovacao;
  }

  getDataInicioExecucao(): Date | null {
    return this.dataInicioExecucao;
  }

  getDataFinalizacao(): Date | null {
    return this.dataFinalizacao;
  }

  getDataEntrega(): Date | null {
    return this.dataEntrega;
  }
}
