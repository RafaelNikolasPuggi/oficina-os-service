import {
  DuplicateEntityException,
  EntityNotFoundException,
} from '../../../shared/domain/exceptions';
import { Cliente } from '../domain/cliente.entity';
import type { ClienteRepository } from '../domain/cliente.repository';
import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  let clienteRepository: jest.Mocked<ClienteRepository>;
  let service: ClientesService;

  beforeEach(() => {
    clienteRepository = {
      salvar: jest.fn(async (cliente) => cliente),
      buscarPorId: jest.fn(),
      buscarPorDocumento: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    };
    service = new ClientesService(clienteRepository);
  });

  it('cria um cliente quando o documento ainda não está cadastrado', async () => {
    clienteRepository.buscarPorDocumento.mockResolvedValueOnce(null);

    const cliente = await service.criar({
      nome: 'Maria da Silva',
      documento: '111.444.777-35',
      email: 'maria@email.com',
      telefone: '11999998888',
    });

    expect(cliente.getNome()).toBe('Maria da Silva');
    expect(clienteRepository.salvar).toHaveBeenCalledTimes(1);
  });

  it('lança DuplicateEntityException se já existir cliente com o mesmo documento', async () => {
    const existente = Cliente.criar({
      id: 'cliente-1',
      nome: 'Maria da Silva',
      documento: '111.444.777-35',
      email: 'maria@email.com',
      telefone: '11999998888',
    });
    clienteRepository.buscarPorDocumento.mockResolvedValueOnce(existente);

    await expect(
      service.criar({
        nome: 'Outra Maria',
        documento: '111.444.777-35',
        email: 'a@a.com',
        telefone: '1',
      }),
    ).rejects.toThrow(DuplicateEntityException);
  });

  it('lança EntityNotFoundException ao obter um cliente inexistente', async () => {
    clienteRepository.buscarPorId.mockResolvedValueOnce(null);

    await expect(service.obter('inexistente')).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('atualiza os dados cadastrais de um cliente existente', async () => {
    const existente = Cliente.criar({
      id: 'cliente-1',
      nome: 'Maria da Silva',
      documento: '111.444.777-35',
      email: 'maria@email.com',
      telefone: '11999998888',
    });
    clienteRepository.buscarPorId.mockResolvedValueOnce(existente);

    const atualizado = await service.atualizar('cliente-1', {
      nome: 'Maria S. Souza',
    });

    expect(atualizado.getNome()).toBe('Maria S. Souza');
  });
});
