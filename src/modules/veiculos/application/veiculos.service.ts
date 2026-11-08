import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  DuplicateEntityException,
  EntityNotFoundException,
} from '../../../shared/domain/exceptions';
import { Placa } from '../../../shared/domain/placa.vo';
import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { CLIENTE_REPOSITORY } from '../../clientes/domain/cliente.repository';
import type { ClienteRepository } from '../../clientes/domain/cliente.repository';
import { Veiculo } from '../domain/veiculo.entity';
import { VEICULO_REPOSITORY } from '../domain/veiculo.repository';
import type { VeiculoRepository } from '../domain/veiculo.repository';

export interface CriarVeiculoInput {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export interface AtualizarVeiculoInput {
  marca?: string;
  modelo?: string;
  ano?: number;
}

@Injectable()
export class VeiculosService {
  constructor(
    @Inject(VEICULO_REPOSITORY)
    private readonly veiculoRepository: VeiculoRepository,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async criar(input: CriarVeiculoInput): Promise<Veiculo> {
    const cliente = await this.clienteRepository.buscarPorId(input.clienteId);
    if (!cliente) {
      throw new EntityNotFoundException('Cliente', input.clienteId);
    }

    // A placa é persistida normalizada (sem espaço/traço, maiúscula -- ver
    // Placa/Veiculo.criar); normaliza antes de comparar pelo mesmo motivo
    // documentado em ClientesService.criar.
    const placaNormalizada = Placa.criar(input.placa).getValor();
    const existente =
      await this.veiculoRepository.buscarPorPlaca(placaNormalizada);
    if (existente) {
      throw new DuplicateEntityException('Veículo', 'placa', input.placa);
    }

    const veiculo = Veiculo.criar({ id: randomUUID(), ...input });
    return this.veiculoRepository.salvar(veiculo);
  }

  async atualizar(id: string, input: AtualizarVeiculoInput): Promise<Veiculo> {
    const veiculo = await this.obter(id);
    veiculo.atualizar(input);
    return this.veiculoRepository.salvar(veiculo);
  }

  async obter(id: string): Promise<Veiculo> {
    const veiculo = await this.veiculoRepository.buscarPorId(id);
    if (!veiculo) {
      throw new EntityNotFoundException('Veículo', id);
    }
    return veiculo;
  }

  async listarPorCliente(clienteId: string): Promise<Veiculo[]> {
    return this.veiculoRepository.listarPorCliente(clienteId);
  }

  async listar(page: number, limit: number): Promise<PaginatedResult<Veiculo>> {
    return this.veiculoRepository.listar(page, limit);
  }

  async remover(id: string): Promise<void> {
    await this.obter(id);
    await this.veiculoRepository.remover(id);
  }
}
