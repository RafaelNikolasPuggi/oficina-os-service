import { OrdemServico } from '../../domain/ordem-servico.entity';
import type { OrdensServicoService } from '../../application/ordens-servico.service';
import { OrdensServicoController } from './ordens-servico.controller';

describe('OrdensServicoController', () => {
  let ordensServicoService: jest.Mocked<OrdensServicoService>;
  let controller: OrdensServicoController;

  function osAberta(): OrdemServico {
    return OrdemServico.abrir({
      id: 'os-1',
      clienteId: 'cliente-1',
      veiculoId: 'veiculo-1',
      itensServico: [],
      itensPeca: [],
    });
  }

  beforeEach(() => {
    ordensServicoService = {
      abrir: jest.fn(),
      listar: jest.fn(),
      tempoMedioExecucao: jest.fn(),
      obter: jest.fn(),
      iniciarDiagnostico: jest.fn(),
      registrarDiagnostico: jest.fn(),
      finalizar: jest.fn(),
      entregar: jest.fn(),
      consultarStatus: jest.fn(),
      aprovarOrcamento: jest.fn(),
      recusarOrcamento: jest.fn(),
    } as unknown as jest.Mocked<OrdensServicoService>;

    controller = new OrdensServicoController(ordensServicoService);
  });

  it('abrir delega pro service e devolve o DTO de resposta', async () => {
    ordensServicoService.abrir.mockResolvedValueOnce(osAberta());

    const resultado = await controller.abrir({
      clienteId: 'cliente-1',
      veiculoId: 'veiculo-1',
      servicos: [],
      pecas: [],
    });

    expect(resultado.id).toBe('os-1');
  });

  it('listar devolve a página mapeada pra DTO', async () => {
    ordensServicoService.listar.mockResolvedValueOnce({
      items: [osAberta()],
      total: 1,
      page: 1,
      limit: 20,
    });

    const resultado = await controller.listar({ page: 1, limit: 20 });

    expect(resultado.total).toBe(1);
    expect(resultado.items[0].id).toBe('os-1');
  });

  it('tempoMedioExecucao delega direto pro service', async () => {
    ordensServicoService.tempoMedioExecucao.mockResolvedValueOnce({
      quantidadeOSFinalizadas: 2,
      tempoMedioMinutos: 45,
    });

    const resultado = await controller.tempoMedioExecucao();

    expect(resultado.tempoMedioMinutos).toBe(45);
  });

  it('obter devolve a OS mapeada pra DTO', async () => {
    ordensServicoService.obter.mockResolvedValueOnce(osAberta());

    const resultado = await controller.obter('os-1');

    expect(resultado.id).toBe('os-1');
  });

  it('iniciarDiagnostico delega pro service', async () => {
    ordensServicoService.iniciarDiagnostico.mockResolvedValueOnce(osAberta());

    await controller.iniciarDiagnostico('os-1');

    expect(ordensServicoService.iniciarDiagnostico).toHaveBeenCalledWith(
      'os-1',
    );
  });

  it('registrarDiagnostico delega pro service com o DTO', async () => {
    ordensServicoService.registrarDiagnostico.mockResolvedValueOnce(osAberta());
    const dto = {
      observacao: 'ok',
      servicosAdicionais: [],
      pecasAdicionais: [],
    };

    await controller.registrarDiagnostico('os-1', dto);

    expect(ordensServicoService.registrarDiagnostico).toHaveBeenCalledWith(
      'os-1',
      dto,
    );
  });

  it('finalizar delega pro service', async () => {
    ordensServicoService.finalizar.mockResolvedValueOnce(osAberta());

    await controller.finalizar('os-1');

    expect(ordensServicoService.finalizar).toHaveBeenCalledWith('os-1');
  });

  it('entregar delega pro service', async () => {
    ordensServicoService.entregar.mockResolvedValueOnce(osAberta());

    await controller.entregar('os-1');

    expect(ordensServicoService.entregar).toHaveBeenCalledWith('os-1');
  });

  it('consultarStatus delega pro service com o clienteId do token', async () => {
    ordensServicoService.consultarStatus.mockResolvedValueOnce(osAberta());

    await controller.consultarStatus('os-1', 'cliente-1');

    expect(ordensServicoService.consultarStatus).toHaveBeenCalledWith(
      'os-1',
      'cliente-1',
    );
  });

  it('decidirOrcamento chama aprovarOrcamento quando aprovado=true', async () => {
    ordensServicoService.aprovarOrcamento.mockResolvedValueOnce(osAberta());

    await controller.decidirOrcamento('os-1', 'cliente-1', { aprovado: true });

    expect(ordensServicoService.aprovarOrcamento).toHaveBeenCalledWith(
      'os-1',
      'cliente-1',
    );
    expect(ordensServicoService.recusarOrcamento).not.toHaveBeenCalled();
  });

  it('decidirOrcamento chama recusarOrcamento quando aprovado=false', async () => {
    ordensServicoService.recusarOrcamento.mockResolvedValueOnce(osAberta());

    await controller.decidirOrcamento('os-1', 'cliente-1', {
      aprovado: false,
    });

    expect(ordensServicoService.recusarOrcamento).toHaveBeenCalledWith(
      'os-1',
      'cliente-1',
    );
    expect(ordensServicoService.aprovarOrcamento).not.toHaveBeenCalled();
  });
});
