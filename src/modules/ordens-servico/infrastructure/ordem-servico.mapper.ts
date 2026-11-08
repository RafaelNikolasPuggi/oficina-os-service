import { OrdemServico } from '../domain/ordem-servico.entity';
import { OrdemServicoOrmEntity } from './ordem-servico.orm-entity';

export class OrdemServicoMapper {
  static toDomain(orm: OrdemServicoOrmEntity): OrdemServico {
    return OrdemServico.restaurar({
      id: orm.id,
      clienteId: orm.clienteId,
      veiculoId: orm.veiculoId,
      status: orm.status,
      itensServico: orm.itensServico,
      itensPeca: orm.itensPeca,
      observacaoDiagnostico: orm.observacaoDiagnostico,
      valorTotal: parseFloat(orm.valorTotal),
      dataRecebimento: orm.dataRecebimento,
      dataDiagnostico: orm.dataDiagnostico,
      dataAprovacao: orm.dataAprovacao,
      dataInicioExecucao: orm.dataInicioExecucao,
      dataFinalizacao: orm.dataFinalizacao,
      dataEntrega: orm.dataEntrega,
    });
  }

  static toOrm(domain: OrdemServico): OrdemServicoOrmEntity {
    const orm = new OrdemServicoOrmEntity();
    orm.id = domain.id;
    orm.clienteId = domain.getClienteId();
    orm.veiculoId = domain.getVeiculoId();
    orm.status = domain.getStatus();
    orm.itensServico = [...domain.getItensServico()];
    orm.itensPeca = [...domain.getItensPeca()];
    orm.observacaoDiagnostico = domain.getObservacaoDiagnostico();
    orm.valorTotal = domain.getValorTotal().toFixed(2);
    orm.dataRecebimento = domain.getDataRecebimento();
    orm.dataDiagnostico = domain.getDataDiagnostico();
    orm.dataAprovacao = domain.getDataAprovacao();
    orm.dataInicioExecucao = domain.getDataInicioExecucao();
    orm.dataFinalizacao = domain.getDataFinalizacao();
    orm.dataEntrega = domain.getDataEntrega();
    return orm;
  }
}
