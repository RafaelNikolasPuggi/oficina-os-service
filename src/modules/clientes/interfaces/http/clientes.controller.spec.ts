import { Cliente } from '../../domain/cliente.entity';
import type { ClientesService } from '../../application/clientes.service';
import { ClientesController } from './clientes.controller';

describe('ClientesController', () => {
  let clientesService: jest.Mocked<ClientesService>;
  let controller: ClientesController;

  const cliente = Cliente.criar({
    id: 'cliente-1',
    nome: 'Maria da Silva',
    documento: '111.444.777-35',
    email: 'maria@email.com',
    telefone: '11999998888',
  });

  beforeEach(() => {
    clientesService = {
      criar: jest.fn(),
      atualizar: jest.fn(),
      obter: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    } as unknown as jest.Mocked<ClientesService>;

    controller = new ClientesController(clientesService);
  });

  it('criar delega para o service e devolve o DTO de resposta', async () => {
    clientesService.criar.mockResolvedValueOnce(cliente);

    const resultado = await controller.criar({
      nome: 'Maria da Silva',
      documento: '111.444.777-35',
      email: 'maria@email.com',
      telefone: '11999998888',
    });

    expect(resultado.id).toBe('cliente-1');
    expect(resultado.documento).toBe(cliente.getDocumento().formatado());
  });

  it('listar devolve a página mapeada pra DTO', async () => {
    clientesService.listar.mockResolvedValueOnce({
      items: [cliente],
      total: 1,
      page: 1,
      limit: 20,
    });

    const resultado = await controller.listar({ page: 1, limit: 20 });

    expect(resultado.total).toBe(1);
    expect(resultado.items[0].id).toBe('cliente-1');
  });

  it('obter devolve o cliente mapeado pra DTO', async () => {
    clientesService.obter.mockResolvedValueOnce(cliente);

    const resultado = await controller.obter('cliente-1');

    expect(resultado.nome).toBe('Maria da Silva');
  });

  it('atualizar delega para o service', async () => {
    clientesService.atualizar.mockResolvedValueOnce(cliente);

    const resultado = await controller.atualizar('cliente-1', {
      telefone: '11988887777',
    });

    expect(clientesService.atualizar).toHaveBeenCalledWith('cliente-1', {
      telefone: '11988887777',
    });
    expect(resultado.id).toBe('cliente-1');
  });

  it('remover delega para o service', async () => {
    await controller.remover('cliente-1');

    expect(clientesService.remover).toHaveBeenCalledWith('cliente-1');
  });
});
