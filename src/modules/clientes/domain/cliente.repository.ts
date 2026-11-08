import { PaginatedResult } from '../../../shared/dto/pagination.dto';
import { Cliente } from './cliente.entity';

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');

export interface ClienteRepository {
  salvar(cliente: Cliente): Promise<Cliente>;
  buscarPorId(id: string): Promise<Cliente | null>;
  buscarPorDocumento(documento: string): Promise<Cliente | null>;
  listar(page: number, limit: number): Promise<PaginatedResult<Cliente>>;
  remover(id: string): Promise<void>;
}
