import { Cliente } from '../domain/cliente.entity';
import { ClienteMapper } from './cliente.mapper';
import { ClienteOrmEntity } from './cliente.orm-entity';

describe('ClienteMapper', () => {
  it('converte de domínio para ORM', () => {
    const cliente = Cliente.criar({
      id: 'cliente-1',
      nome: 'Maria da Silva',
      documento: '111.444.777-35',
      email: 'maria@email.com',
      telefone: '11999998888',
    });

    const orm = ClienteMapper.toOrm(cliente);

    expect(orm.id).toBe('cliente-1');
    expect(orm.nome).toBe('Maria da Silva');
    expect(orm.documento).toBe('11144477735');
    expect(orm.email).toBe('maria@email.com');
    expect(orm.telefone).toBe('11999998888');
  });

  it('converte de ORM para domínio', () => {
    const orm = new ClienteOrmEntity();
    orm.id = 'cliente-1';
    orm.nome = 'Maria da Silva';
    orm.documento = '11144477735';
    orm.email = 'maria@email.com';
    orm.telefone = '11999998888';

    const cliente = ClienteMapper.toDomain(orm);

    expect(cliente.id).toBe('cliente-1');
    expect(cliente.getNome()).toBe('Maria da Silva');
    expect(cliente.getDocumento().getValor()).toBe('11144477735');
    expect(cliente.getEmail()).toBe('maria@email.com');
  });
});
