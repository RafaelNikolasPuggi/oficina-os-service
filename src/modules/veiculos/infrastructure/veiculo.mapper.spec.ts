import { Veiculo } from '../domain/veiculo.entity';
import { VeiculoMapper } from './veiculo.mapper';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

describe('VeiculoMapper', () => {
  it('converte de domínio para ORM', () => {
    const veiculo = Veiculo.criar({
      id: 'veiculo-1',
      clienteId: 'cliente-1',
      placa: 'ABC1234',
      marca: 'VW',
      modelo: 'Gol',
      ano: 2020,
    });

    const orm = VeiculoMapper.toOrm(veiculo);

    expect(orm.id).toBe('veiculo-1');
    expect(orm.clienteId).toBe('cliente-1');
    expect(orm.placa).toBe('ABC1234');
    expect(orm.marca).toBe('VW');
    expect(orm.ano).toBe(2020);
  });

  it('converte de ORM para domínio', () => {
    const orm = new VeiculoOrmEntity();
    orm.id = 'veiculo-1';
    orm.clienteId = 'cliente-1';
    orm.placa = 'ABC1234';
    orm.marca = 'VW';
    orm.modelo = 'Gol';
    orm.ano = 2020;

    const veiculo = VeiculoMapper.toDomain(orm);

    expect(veiculo.id).toBe('veiculo-1');
    expect(veiculo.getClienteId()).toBe('cliente-1');
    expect(veiculo.getPlaca().getValor()).toBe('ABC1234');
    expect(veiculo.getModelo()).toBe('Gol');
  });
});
