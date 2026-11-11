import type { ClientProxy } from '@nestjs/microservices';
import { RabbitMqSagaEventsPublisher } from './saga-events.publisher';

describe('RabbitMqSagaEventsPublisher', () => {
  let producaoClient: jest.Mocked<Pick<ClientProxy, 'emit'>>;
  let pagamentoClient: jest.Mocked<Pick<ClientProxy, 'emit'>>;
  let publisher: RabbitMqSagaEventsPublisher;

  beforeEach(() => {
    producaoClient = { emit: jest.fn() };
    pagamentoClient = { emit: jest.fn() };
    publisher = new RabbitMqSagaEventsPublisher(
      producaoClient as unknown as ClientProxy,
      pagamentoClient as unknown as ClientProxy,
    );
  });

  it('publicarOrcamentoAprovado emite no client de produção', () => {
    publisher.publicarOrcamentoAprovado({
      ordemServicoId: 'os-1',
      itens: [{ pecaId: 'peca-1', quantidade: 2 }],
    });

    expect(producaoClient.emit).toHaveBeenCalledWith('orcamento.aprovado', {
      ordemServicoId: 'os-1',
      itens: [{ pecaId: 'peca-1', quantidade: 2 }],
    });
  });

  it('publicarOsFinalizada emite no client de pagamento', () => {
    publisher.publicarOsFinalizada({
      ordemServicoId: 'os-1',
      clienteId: 'cliente-1',
      valor: 210,
    });

    expect(pagamentoClient.emit).toHaveBeenCalledWith('os.finalizada', {
      ordemServicoId: 'os-1',
      clienteId: 'cliente-1',
      valor: 210,
    });
  });
});
