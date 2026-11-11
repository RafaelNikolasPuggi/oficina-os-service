import type { OrdensServicoService } from '../../application/ordens-servico.service';
import { OrdensServicoEventsController } from './ordens-servico.events-controller';

describe('OrdensServicoEventsController', () => {
  let ordensServicoService: jest.Mocked<
    Pick<
      OrdensServicoService,
      | 'confirmarReservaDePecas'
      | 'registrarFalhaReservaDePecas'
      | 'confirmarPagamento'
      | 'rejeitarPagamento'
    >
  >;
  let controller: OrdensServicoEventsController;

  beforeEach(() => {
    ordensServicoService = {
      confirmarReservaDePecas: jest.fn().mockResolvedValue(undefined),
      registrarFalhaReservaDePecas: jest.fn().mockResolvedValue(undefined),
      confirmarPagamento: jest.fn().mockResolvedValue(undefined),
      rejeitarPagamento: jest.fn().mockResolvedValue(undefined),
    };
    controller = new OrdensServicoEventsController(
      ordensServicoService as unknown as OrdensServicoService,
    );
  });

  it('aoReservarPecas delega pro service', async () => {
    await controller.aoReservarPecas({ ordemServicoId: 'os-1' });

    expect(ordensServicoService.confirmarReservaDePecas).toHaveBeenCalledWith(
      'os-1',
    );
  });

  it('aoReservarPecas não lança quando o service falha', async () => {
    ordensServicoService.confirmarReservaDePecas.mockRejectedValueOnce(
      new Error('boom'),
    );

    await expect(
      controller.aoReservarPecas({ ordemServicoId: 'os-1' }),
    ).resolves.toBeUndefined();
  });

  it('aoFalharReservaDePecas delega pro service', async () => {
    const evento = {
      ordemServicoId: 'os-1',
      pecaNome: 'Óleo',
      disponivel: 1,
      solicitado: 2,
    };

    await controller.aoFalharReservaDePecas(evento);

    expect(
      ordensServicoService.registrarFalhaReservaDePecas,
    ).toHaveBeenCalledWith(evento);
  });

  it('aoAprovarPagamento delega pro service', async () => {
    await controller.aoAprovarPagamento({ ordemServicoId: 'os-1' });

    expect(ordensServicoService.confirmarPagamento).toHaveBeenCalledWith(
      'os-1',
    );
  });

  it('aoRejeitarPagamento delega pro service', async () => {
    await controller.aoRejeitarPagamento({ ordemServicoId: 'os-1' });

    expect(ordensServicoService.rejeitarPagamento).toHaveBeenCalledWith('os-1');
  });
});
