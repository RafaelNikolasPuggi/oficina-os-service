import { Veiculo } from '../../domain/veiculo.entity';
import type { VeiculosService } from '../../application/veiculos.service';
import { VeiculosController } from './veiculos.controller';

describe('VeiculosController', () => {
  let veiculosService: jest.Mocked<VeiculosService>;
  let controller: VeiculosController;

  const veiculo = Veiculo.criar({
    id: 'veiculo-1',
    clienteId: 'cliente-1',
    placa: 'ABC1234',
    marca: 'VW',
    modelo: 'Gol',
    ano: 2020,
  });

  beforeEach(() => {
    veiculosService = {
      criar: jest.fn(),
      atualizar: jest.fn(),
      obter: jest.fn(),
      listar: jest.fn(),
      listarPorCliente: jest.fn(),
      remover: jest.fn(),
    } as unknown as jest.Mocked<VeiculosService>;

    controller = new VeiculosController(veiculosService);
  });

  it('criar delega para o service e devolve o DTO de resposta', async () => {
    veiculosService.criar.mockResolvedValueOnce(veiculo);

    const resultado = await controller.criar({
      clienteId: 'cliente-1',
      placa: 'ABC1234',
      marca: 'VW',
      modelo: 'Gol',
      ano: 2020,
    });

    expect(resultado.id).toBe('veiculo-1');
    expect(resultado.placa).toBe('ABC1234');
  });

  it('listar devolve a página mapeada pra DTO', async () => {
    veiculosService.listar.mockResolvedValueOnce({
      items: [veiculo],
      total: 1,
      page: 1,
      limit: 20,
    });

    const resultado = await controller.listar({ page: 1, limit: 20 });

    expect(resultado.total).toBe(1);
    expect(resultado.items[0].id).toBe('veiculo-1');
  });

  it('obter devolve o veículo mapeado pra DTO', async () => {
    veiculosService.obter.mockResolvedValueOnce(veiculo);

    const resultado = await controller.obter('veiculo-1');

    expect(resultado.modelo).toBe('Gol');
  });

  it('atualizar delega para o service', async () => {
    veiculosService.atualizar.mockResolvedValueOnce(veiculo);

    const resultado = await controller.atualizar('veiculo-1', { ano: 2021 });

    expect(veiculosService.atualizar).toHaveBeenCalledWith('veiculo-1', {
      ano: 2021,
    });
    expect(resultado.id).toBe('veiculo-1');
  });

  it('remover delega para o service', async () => {
    await controller.remover('veiculo-1');

    expect(veiculosService.remover).toHaveBeenCalledWith('veiculo-1');
  });
});
