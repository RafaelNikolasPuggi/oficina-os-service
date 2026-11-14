import { defineFeature, loadFeature } from 'jest-cucumber';
import { Cliente } from '../../src/modules/clientes/domain/cliente.entity';
import type { ClienteRepository } from '../../src/modules/clientes/domain/cliente.repository';
import { Veiculo } from '../../src/modules/veiculos/domain/veiculo.entity';
import type { VeiculoRepository } from '../../src/modules/veiculos/domain/veiculo.repository';
import { OrdemServico } from '../../src/modules/ordens-servico/domain/ordem-servico.entity';
import { StatusOrdemServico } from '../../src/modules/ordens-servico/domain/status-ordem-servico.enum';
import type { OrdemServicoRepository } from '../../src/modules/ordens-servico/domain/ordem-servico.repository';
import type {
  PecaCatalogo,
  ProducaoServiceClient,
} from '../../src/modules/ordens-servico/infrastructure/producao-service.client';
import type {
  OrcamentoAprovadoEvent,
  OsFinalizadaEvent,
  SagaEventsPublisher,
} from '../../src/modules/ordens-servico/infrastructure/saga-events.publisher';
import { OrdensServicoService } from '../../src/modules/ordens-servico/application/ordens-servico.service';

/**
 * Este teste exercita a orquestração REAL da Saga do lado do os-service
 * (estado da OS, transições, notificações) ponta a ponta. O
 * producao-service e o pagamento-service são simulados exatamente na
 * borda onde o os-service os enxerga — mensageria assíncrona (eventos
 * publicados/consumidos) e o cliente HTTP de catálogo — porque os 3
 * serviços ainda não têm um ambiente local com Postgres×2 + MongoDB +
 * RabbitMQ rodando juntos para um teste de integração "fio a fio" real.
 * Quando esse ambiente existir, este arquivo é o ponto de partida natural
 * para trocar os fakes por chamadas de rede de verdade.
 */

const feature = loadFeature('./test/features/saga-ordem-servico.feature');

class OrdemServicoRepositoryFake implements OrdemServicoRepository {
  private readonly porId = new Map<string, OrdemServico>();

  async salvar(ordemServico: OrdemServico): Promise<OrdemServico> {
    this.porId.set(ordemServico.id, ordemServico);
    return ordemServico;
  }

  async buscarPorId(id: string): Promise<OrdemServico | null> {
    return this.porId.get(id) ?? null;
  }

  async listar(): Promise<never> {
    throw new Error('não usado neste cenário');
  }

  async listarFinalizadas(): Promise<OrdemServico[]> {
    return [...this.porId.values()];
  }
}

defineFeature(feature, (test) => {
  const cliente = Cliente.criar({
    id: 'cliente-1',
    nome: 'Maria da Silva',
    documento: '111.444.777-35',
    email: 'maria@email.com',
    telefone: '11999998888',
  });
  const veiculo = Veiculo.criar({
    id: 'veiculo-1',
    clienteId: cliente.id,
    placa: 'ABC1234',
    marca: 'VW',
    modelo: 'Gol',
    ano: 2020,
  });
  const peca: PecaCatalogo = {
    id: 'peca-1',
    nome: 'Óleo 1L',
    preco: 30,
    quantidadeEstoque: 10,
  };

  let ordemServicoRepository: OrdemServicoRepositoryFake;
  let clienteRepository: jest.Mocked<ClienteRepository>;
  let veiculoRepository: jest.Mocked<VeiculoRepository>;
  let producaoServiceClient: jest.Mocked<ProducaoServiceClient>;
  let sagaEventsPublisher: jest.Mocked<SagaEventsPublisher>;
  let emailService: { enviarAtualizacaoDeStatus: jest.Mock };
  let service: OrdensServicoService;
  let ordemServicoId: string;

  function novoService(): OrdensServicoService {
    return new OrdensServicoService(
      ordemServicoRepository,
      clienteRepository,
      veiculoRepository,
      producaoServiceClient,
      sagaEventsPublisher,
      emailService as never,
    );
  }

  function resetar(): void {
    ordemServicoRepository = new OrdemServicoRepositoryFake();
    clienteRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(async (id) => (id === cliente.id ? cliente : null)),
      buscarPorDocumento: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    };
    veiculoRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(async (id) => (id === veiculo.id ? veiculo : null)),
      buscarPorPlaca: jest.fn(),
      listarPorCliente: jest.fn(),
      listar: jest.fn(),
      remover: jest.fn(),
    };
    producaoServiceClient = {
      buscarServicosPorIds: jest.fn(async () => []),
      buscarPecasPorIds: jest.fn(async () => [peca]),
    };
    sagaEventsPublisher = {
      publicarOrcamentoAprovado: jest.fn(),
      publicarOsFinalizada: jest.fn(),
    };
    emailService = {
      enviarAtualizacaoDeStatus: jest.fn().mockResolvedValue(undefined),
    };
    service = novoService();
  }

  /** Simula a resposta do producao-service ao evento `orcamento.aprovado`. */
  async function producaoServiceRespondeComSucesso(
    evento: OrcamentoAprovadoEvent,
  ): Promise<void> {
    await service.confirmarReservaDePecas(evento.ordemServicoId);
  }

  async function producaoServiceRespondeSemEstoque(
    evento: OrcamentoAprovadoEvent,
    detalhe: { pecaNome: string; disponivel: number; solicitado: number },
  ): Promise<void> {
    await service.registrarFalhaReservaDePecas({
      ordemServicoId: evento.ordemServicoId,
      ...detalhe,
    });
  }

  /** Simula a notificação `pagamento.rejeitado` do pagamento-service. */
  async function pagamentoServiceRejeita(
    evento: OsFinalizadaEvent,
  ): Promise<void> {
    await service.rejeitarPagamento(evento.ordemServicoId);
  }

  async function pagamentoServiceAprova(ordemServicoId: string): Promise<void> {
    await service.confirmarPagamento(ordemServicoId);
  }

  test('Fluxo feliz completo até a entrega', ({ given, when, then, and }) => {
    given(
      'uma ordem de serviço aguardando aprovação do cliente, com uma peça em estoque suficiente',
      async () => {
        resetar();
        const os = await service.abrir({
          clienteId: cliente.id,
          veiculoId: veiculo.id,
          servicos: [],
          pecas: [{ id: peca.id, quantidade: 2 }],
        });
        ordemServicoId = os.id;
        await service.iniciarDiagnostico(ordemServicoId);
        await service.registrarDiagnostico(ordemServicoId, {
          observacao: 'ok',
          servicosAdicionais: [],
          pecasAdicionais: [],
        });
      },
    );

    when('o cliente aprova o orçamento', async () => {
      await service.aprovarOrcamento(ordemServicoId, cliente.id);
    });

    and('o producao-service confirma a reserva das peças', async () => {
      const evento =
        sagaEventsPublisher.publicarOrcamentoAprovado.mock.calls[0][0];
      await producaoServiceRespondeComSucesso(evento);
    });

    then('a ordem de serviço é transicionada para execução', async () => {
      const os = await service.obter(ordemServicoId);
      expect(os.getStatus()).toBe(StatusOrdemServico.EM_EXECUCAO);
    });

    when('a oficina finaliza a execução da ordem de serviço', async () => {
      await service.finalizar(ordemServicoId);
    });

    then(
      'o pagamento-service é notificado para cobrar o cliente pela ordem de serviço',
      () => {
        expect(sagaEventsPublisher.publicarOsFinalizada).toHaveBeenCalledWith(
          expect.objectContaining({ ordemServicoId, clienteId: cliente.id }),
        );
      },
    );

    when(
      'o pagamento-service confirma que o pagamento foi aprovado',
      async () => {
        await pagamentoServiceAprova(ordemServicoId);
      },
    );

    then('a ordem de serviço pode ser entregue ao cliente', async () => {
      const entregue = await service.entregar(ordemServicoId);
      expect(entregue.getStatus()).toBe(StatusOrdemServico.ENTREGUE);
    });
  });

  test('Compensação — falta de estoque recusa a aprovação do orçamento', ({
    given,
    when,
    and,
    then,
  }) => {
    given(
      'uma ordem de serviço aguardando aprovação do cliente, com uma peça sem estoque suficiente',
      async () => {
        resetar();
        const os = await service.abrir({
          clienteId: cliente.id,
          veiculoId: veiculo.id,
          servicos: [],
          pecas: [{ id: peca.id, quantidade: 1 }],
        });
        ordemServicoId = os.id;
        await service.iniciarDiagnostico(ordemServicoId);
        await service.registrarDiagnostico(ordemServicoId, {
          observacao: 'ok',
          servicosAdicionais: [],
          pecasAdicionais: [],
        });
      },
    );

    when('o cliente aprova o orçamento', async () => {
      await service.aprovarOrcamento(ordemServicoId, cliente.id);
    });

    and(
      'o producao-service recusa a reserva por falta de estoque',
      async () => {
        const evento =
          sagaEventsPublisher.publicarOrcamentoAprovado.mock.calls[0][0];
        await producaoServiceRespondeSemEstoque(evento, {
          pecaNome: peca.nome,
          disponivel: 0,
          solicitado: 1,
        });
      },
    );

    then(
      'a ordem de serviço permanece aguardando aprovação do cliente',
      async () => {
        const os = await service.obter(ordemServicoId);
        expect(os.getStatus()).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO);
      },
    );

    and('o cliente é notificado sobre a falta da peça', () => {
      expect(emailService.enviarAtualizacaoDeStatus).toHaveBeenCalledWith(
        cliente.getEmail(),
        expect.any(String),
        expect.stringContaining(peca.nome),
      );
    });
  });

  test('Compensação — pagamento rejeitado bloqueia a entrega', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      'uma ordem de serviço finalizada aguardando confirmação de pagamento',
      async () => {
        resetar();
        const os = await service.abrir({
          clienteId: cliente.id,
          veiculoId: veiculo.id,
          servicos: [],
          pecas: [],
        });
        ordemServicoId = os.id;
        await service.iniciarDiagnostico(ordemServicoId);
        await service.registrarDiagnostico(ordemServicoId, {
          observacao: 'ok',
          servicosAdicionais: [],
          pecasAdicionais: [],
        });
        await service.aprovarOrcamento(ordemServicoId, cliente.id);
        await producaoServiceRespondeComSucesso({
          ordemServicoId,
          itens: [],
        });
        await service.finalizar(ordemServicoId);
      },
    );

    when(
      'o pagamento-service informa que o pagamento foi rejeitado',
      async () => {
        const evento =
          sagaEventsPublisher.publicarOsFinalizada.mock.calls[0][0];
        await pagamentoServiceRejeita(evento);
      },
    );

    then(
      'a ordem de serviço continua finalizada e não pode ser entregue',
      async () => {
        const os = await service.obter(ordemServicoId);
        expect(os.getStatus()).toBe(StatusOrdemServico.FINALIZADA);
        await expect(service.entregar(ordemServicoId)).rejects.toThrow();
      },
    );

    and('o cliente é notificado para tentar o pagamento novamente', () => {
      expect(emailService.enviarAtualizacaoDeStatus).toHaveBeenCalledWith(
        cliente.getEmail(),
        expect.any(String),
        expect.stringContaining('pagamento'),
      );
    });
  });
});
