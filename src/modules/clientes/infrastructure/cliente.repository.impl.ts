import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { Cliente } from '../domain/cliente.entity';
import { ClienteRepository } from '../domain/cliente.repository';
import { ClienteMapper } from './cliente.mapper';
import { ClienteOrmEntity } from './cliente.orm-entity';

@Injectable()
export class TypeOrmClienteRepository implements ClienteRepository {
  constructor(
    @InjectRepository(ClienteOrmEntity)
    private readonly repo: Repository<ClienteOrmEntity>,
  ) {}

  async salvar(cliente: Cliente): Promise<Cliente> {
    const orm = ClienteMapper.toOrm(cliente);
    const salvo = await this.repo.save(orm);
    return ClienteMapper.toDomain(salvo);
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? ClienteMapper.toDomain(orm) : null;
  }

  async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    const orm = await this.repo.findOne({ where: { documento } });
    return orm ? ClienteMapper.toDomain(orm) : null;
  }

  async listar(page: number, limit: number): Promise<PaginatedResult<Cliente>> {
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: rows.map((item) => ClienteMapper.toDomain(item)),
      total,
      page,
      limit,
    };
  }

  async remover(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
