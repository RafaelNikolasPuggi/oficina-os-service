import {
  DuplicateEntityException,
  EntityNotFoundException,
} from '../../../shared/domain/exceptions';
import { Cliente } from '../../clientes/domain/cliente.entity';
import type { ClienteRepository } from '../../clientes/domain/cliente.repository';
import { Veiculo } from '../domain/veiculo.entity';
import type { VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculosService } from './veiculos.service';

describe('VeiculosService', () => {
  const cliente = Cliente.criar({
    id: 'cliente-1',
    nome: 'Maria da Silva',
    documento: '111.444.777-35',
    email: 'maria@email.com',
    telefone: '11999998888',
  });

  let veiculoRepository: jest.Mocked<VeiculoRepository>;
  let clienteRepository: jest.Mocked<ClienteRepository>;
  let service: VeiculosService;

  beforeEach(() => {
    veiculoRepository = {
      salvar: jest.fn(async (v) => v),
      buscarPorId: jest.fn(),
      buscarPorPlaca: jest.fn(),
      listarPorCliente: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    };
    clienteRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(async (id) => (id === cliente.id ? cliente : null)),
      buscarPorDocumento: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    };

    service = new VeiculosService(veiculoRepository, clienteRepository);
  });

  describe('criar', () => {
    it('cria o veículo quando o cliente existe e a placa é inédita', async () => {
      veiculoRepository.buscarPorPlaca.mockResolvedValueOnce(null);

      const veiculo = await service.criar({
        clienteId: cliente.id,
        placa: 'ABC1234',
        marca: 'VW',
        modelo: 'Gol',
        ano: 2020,
      });

      expect(veiculo.getPlaca().getValor()).toBe('ABC1234');
      expect(veiculoRepository.salvar).toHaveBeenCalledTimes(1);
    });

    it('lança EntityNotFoundException se o cliente não existir', async () => {
      await expect(
        service.criar({
          clienteId: 'inexistente',
          placa: 'ABC1234',
          marca: 'VW',
          modelo: 'Gol',
          ano: 2020,
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('lança DuplicateEntityException se a placa já existir', async () => {
      const existente = Veiculo.criar({
        id: 'veiculo-2',
        clienteId: cliente.id,
        placa: 'ABC1234',
        marca: 'VW',
        modelo: 'Gol',
        ano: 2020,
      });
      veiculoRepository.buscarPorPlaca.mockResolvedValueOnce(existente);

      await expect(
        service.criar({
          clienteId: cliente.id,
          placa: 'ABC-1234',
          marca: 'VW',
          modelo: 'Gol',
          ano: 2020,
        }),
      ).rejects.toThrow(DuplicateEntityException);
    });
  });

  describe('demais operações', () => {
    it('atualizar aplica as mudanças e salva', async () => {
      const veiculo = Veiculo.criar({
        id: 'veiculo-1',
        clienteId: cliente.id,
        placa: 'ABC1234',
        marca: 'VW',
        modelo: 'Gol',
        ano: 2020,
      });
      veiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      const atualizado = await service.atualizar('veiculo-1', { ano: 2021 });

      expect(atualizado.getAno()).toBe(2021);
    });

    it('obter lança EntityNotFoundException quando o veículo não existe', async () => {
      veiculoRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.obter('inexistente')).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('listarPorCliente delega pro repositório', async () => {
      veiculoRepository.listarPorCliente.mockResolvedValueOnce([]);

      await service.listarPorCliente(cliente.id);

      expect(veiculoRepository.listarPorCliente).toHaveBeenCalledWith(
        cliente.id,
      );
    });

    it('listar delega pro repositório', async () => {
      veiculoRepository.listar.mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await service.listar(1, 20);

      expect(veiculoRepository.listar).toHaveBeenCalledWith(1, 20);
    });

    it('remover verifica existência antes de remover', async () => {
      const veiculo = Veiculo.criar({
        id: 'veiculo-1',
        clienteId: cliente.id,
        placa: 'ABC1234',
        marca: 'VW',
        modelo: 'Gol',
        ano: 2020,
      });
      veiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      await service.remover('veiculo-1');

      expect(veiculoRepository.remover).toHaveBeenCalledWith('veiculo-1');
    });
  });
});
