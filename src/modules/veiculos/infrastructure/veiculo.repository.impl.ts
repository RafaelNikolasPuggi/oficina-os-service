import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { Veiculo } from '../domain/veiculo.entity';
import { VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoMapper } from './veiculo.mapper';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

@Injectable()
export class TypeOrmVeiculoRepository implements VeiculoRepository {
  constructor(
    @InjectRepository(VeiculoOrmEntity)
    private readonly repo: Repository<VeiculoOrmEntity>,
  ) {}

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    const orm = VeiculoMapper.toOrm(veiculo);
    const salvo = await this.repo.save(orm);
    return VeiculoMapper.toDomain(salvo);
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? VeiculoMapper.toDomain(orm) : null;
  }

  async buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    const orm = await this.repo.findOne({
      where: { placa: placa.toUpperCase() },
    });
    return orm ? VeiculoMapper.toDomain(orm) : null;
  }

  async listarPorCliente(clienteId: string): Promise<Veiculo[]> {
    const rows = await this.repo.find({
      where: { clienteId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((item) => VeiculoMapper.toDomain(item));
  }

  async listar(page: number, limit: number): Promise<PaginatedResult<Veiculo>> {
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: rows.map((item) => VeiculoMapper.toDomain(item)),
      total,
      page,
      limit,
    };
  }

  async remover(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
