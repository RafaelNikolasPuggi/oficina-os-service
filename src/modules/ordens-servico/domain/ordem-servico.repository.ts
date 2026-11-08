import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { OrdemServico } from './ordem-servico.entity';
import { StatusOrdemServico } from './status-ordem-servico.enum';

export const ORDEM_SERVICO_REPOSITORY = Symbol('ORDEM_SERVICO_REPOSITORY');

export interface ListarOrdensServicoFiltro {
  status?: StatusOrdemServico;
  page: number;
  limit: number;
}

export interface OrdemServicoRepository {
  salvar(ordemServico: OrdemServico): Promise<OrdemServico>;
  buscarPorId(id: string): Promise<OrdemServico | null>;
  listar(
    filtro: ListarOrdensServicoFiltro,
  ): Promise<PaginatedResult<OrdemServico>>;
  /** OS finalizadas, usadas para o cálculo de tempo médio de execução. */
  listarFinalizadas(): Promise<OrdemServico[]>;
}
