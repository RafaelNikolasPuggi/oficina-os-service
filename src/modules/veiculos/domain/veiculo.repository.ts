import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { Veiculo } from './veiculo.entity';

export const VEICULO_REPOSITORY = Symbol('VEICULO_REPOSITORY');

export interface VeiculoRepository {
  salvar(veiculo: Veiculo): Promise<Veiculo>;
  buscarPorId(id: string): Promise<Veiculo | null>;
  buscarPorPlaca(placa: string): Promise<Veiculo | null>;
  listarPorCliente(clienteId: string): Promise<Veiculo[]>;
  listar(page: number, limit: number): Promise<PaginatedResult<Veiculo>>;
  remover(id: string): Promise<void>;
}
