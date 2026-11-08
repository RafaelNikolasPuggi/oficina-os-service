import { Cliente } from '../domain/cliente.entity';
import { ClienteOrmEntity } from './cliente.orm-entity';

export class ClienteMapper {
  static toDomain(orm: ClienteOrmEntity): Cliente {
    return Cliente.criar({
      id: orm.id,
      nome: orm.nome,
      documento: orm.documento,
      email: orm.email,
      telefone: orm.telefone,
    });
  }

  static toOrm(domain: Cliente): ClienteOrmEntity {
    const orm = new ClienteOrmEntity();
    orm.id = domain.id;
    orm.nome = domain.getNome();
    orm.documento = domain.getDocumento().getValor();
    orm.email = domain.getEmail();
    orm.telefone = domain.getTelefone();
    return orm;
  }
}
