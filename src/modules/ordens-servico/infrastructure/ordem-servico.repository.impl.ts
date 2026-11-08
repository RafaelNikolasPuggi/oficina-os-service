import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { OrdemServico } from '../domain/ordem-servico.entity';
import {
  ListarOrdensServicoFiltro,
  OrdemServicoRepository,
} from '../domain/ordem-servico.repository';
import {
  PRIORIDADE_STATUS_LISTAGEM,
  STATUS_OCULTOS_DA_LISTAGEM_PADRAO,
  StatusOrdemServico,
} from '../domain/status-ordem-servico.enum';
import { OrdemServicoMapper } from './ordem-servico.mapper';
import { OrdemServicoOrmEntity } from './ordem-servico.orm-entity';

@Injectable()
export class TypeOrmOrdemServicoRepository implements OrdemServicoRepository {
  constructor(
    @InjectRepository(OrdemServicoOrmEntity)
    private readonly repo: Repository<OrdemServicoOrmEntity>,
  ) {}

  async salvar(ordemServico: OrdemServico): Promise<OrdemServico> {
    const orm = OrdemServicoMapper.toOrm(ordemServico);
    const salvo = await this.repo.save(orm);
    return OrdemServicoMapper.toDomain(salvo);
  }

  async buscarPorId(id: string): Promise<OrdemServico | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? OrdemServicoMapper.toDomain(orm) : null;
  }

  async listar(
    filtro: ListarOrdensServicoFiltro,
  ): Promise<PaginatedResult<OrdemServico>> {
    const query = this.repo.createQueryBuilder('os');

    if (filtro.status) {
      // Filtro explícito: respeita exatamente o status pedido (permite,
      // por exemplo, consultar o histórico de OS finalizadas/entregues).
      query.where('os.status = :status', { status: filtro.status });
      query.orderBy('os.dataRecebimento', 'ASC');
    } else {
      // Listagem operacional padrão: oculta OS finalizadas/entregues
      // (exclusão lógica) e ordena por prioridade de status.
      query.where('os.status NOT IN (:...ocultos)', {
        ocultos: STATUS_OCULTOS_DA_LISTAGEM_PADRAO,
      });

      const casePrioridade = PRIORIDADE_STATUS_LISTAGEM.map(
        (status, indice) => `WHEN os.status = '${status}' THEN ${indice}`,
      ).join(' ');
      query.orderBy(
        `CASE ${casePrioridade} ELSE ${PRIORIDADE_STATUS_LISTAGEM.length} END`,
        'ASC',
      );
      query.addOrderBy('os.dataRecebimento', 'ASC');
    }

    const [rows, total] = await query
      .skip((filtro.page - 1) * filtro.limit)
      .take(filtro.limit)
      .getManyAndCount();

    return {
      items: rows.map((item) => OrdemServicoMapper.toDomain(item)),
      total,
      page: filtro.page,
      limit: filtro.limit,
    };
  }

  async listarFinalizadas(): Promise<OrdemServico[]> {
    const rows = await this.repo.find({
      where: [
        { status: StatusOrdemServico.FINALIZADA },
        { status: StatusOrdemServico.ENTREGUE },
      ],
    });
    return rows.map((item) => OrdemServicoMapper.toDomain(item));
  }
}
