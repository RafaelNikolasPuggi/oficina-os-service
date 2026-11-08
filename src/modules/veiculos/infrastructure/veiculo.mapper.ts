import { Veiculo } from '../domain/veiculo.entity';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

export class VeiculoMapper {
  static toDomain(orm: VeiculoOrmEntity): Veiculo {
    return Veiculo.criar({
      id: orm.id,
      clienteId: orm.clienteId,
      placa: orm.placa,
      marca: orm.marca,
      modelo: orm.modelo,
      ano: orm.ano,
    });
  }

  static toOrm(domain: Veiculo): VeiculoOrmEntity {
    const orm = new VeiculoOrmEntity();
    orm.id = domain.id;
    orm.clienteId = domain.getClienteId();
    orm.placa = domain.getPlaca().getValor();
    orm.marca = domain.getMarca();
    orm.modelo = domain.getModelo();
    orm.ano = domain.getAno();
    return orm;
  }
}
