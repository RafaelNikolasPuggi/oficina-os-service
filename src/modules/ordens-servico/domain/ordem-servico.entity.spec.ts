import { InvalidStatusTransitionException } from '../../../shared/domain/exceptions';
import { OrdemServico } from './ordem-servico.entity';
import { StatusOrdemServico } from './status-ordem-servico.enum';

function abrirOS() {
  return OrdemServico.abrir({
    id: 'os-1',
    clienteId: 'cliente-1',
    veiculoId: 'veiculo-1',
    itensServico: [
      {
        servicoId: 'servico-1',
        nome: 'Troca de óleo',
        precoUnitario: 150,
        quantidade: 1,
      },
    ],
    itensPeca: [
      { pecaId: 'peca-1', nome: 'Óleo 1L', precoUnitario: 30, quantidade: 4 },
    ],
  });
}

describe('OrdemServico', () => {
  it('abre a OS no status RECEBIDA com o valor total calculado', () => {
    const os = abrirOS();
    expect(os.getStatus()).toBe(StatusOrdemServico.RECEBIDA);
    // 1 * 150 (serviço) + 4 * 30 (peça) = 270
    expect(os.getValorTotal()).toBe(270);
  });

  it('segue o fluxo feliz completo até ENTREGUE', () => {
    const os = abrirOS();

    os.iniciarDiagnostico();
    expect(os.getStatus()).toBe(StatusOrdemServico.EM_DIAGNOSTICO);
    expect(os.getDataDiagnostico()).not.toBeNull();

    os.registrarDiagnostico({
      observacao: 'Pastilhas de freio desgastadas',
      itensServicoAdicionais: [
        {
          servicoId: 'servico-2',
          nome: 'Troca de pastilhas',
          precoUnitario: 200,
          quantidade: 1,
        },
      ],
      itensPecaAdicionais: [],
    });
    expect(os.getStatus()).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO);
    expect(os.getValorTotal()).toBe(470); // 270 + 200

    os.aprovarOrcamento();
    expect(os.getStatus()).toBe(StatusOrdemServico.EM_EXECUCAO);
    expect(os.getDataInicioExecucao()).not.toBeNull();

    os.finalizar();
    expect(os.getStatus()).toBe(StatusOrdemServico.FINALIZADA);

    os.entregar();
    expect(os.getStatus()).toBe(StatusOrdemServico.ENTREGUE);
    expect(os.getDataEntrega()).not.toBeNull();
  });

  it('permite recusar o orçamento a partir de AGUARDANDO_APROVACAO', () => {
    const os = abrirOS();
    os.iniciarDiagnostico();
    os.registrarDiagnostico({
      observacao: 'ok',
      itensServicoAdicionais: [],
      itensPecaAdicionais: [],
    });

    os.recusarOrcamento();

    expect(os.getStatus()).toBe(StatusOrdemServico.RECUSADA);
  });

  it.each([
    [
      'aprovar orçamento direto de RECEBIDA',
      (os: OrdemServico) => os.aprovarOrcamento(),
    ],
    ['finalizar direto de RECEBIDA', (os: OrdemServico) => os.finalizar()],
    ['entregar direto de RECEBIDA', (os: OrdemServico) => os.entregar()],
  ])('rejeita transição inválida: %s', (_descricao, acao) => {
    const os = abrirOS();
    expect(() => acao(os)).toThrow(InvalidStatusTransitionException);
  });

  it('não permite reabrir diagnóstico em uma OS já finalizada', () => {
    const os = abrirOS();
    os.iniciarDiagnostico();
    os.registrarDiagnostico({
      observacao: 'ok',
      itensServicoAdicionais: [],
      itensPecaAdicionais: [],
    });
    os.aprovarOrcamento();
    os.finalizar();

    expect(() => os.iniciarDiagnostico()).toThrow(
      InvalidStatusTransitionException,
    );
  });

  it('calcula o tempo de execução em minutos entre início e finalização', () => {
    const os = abrirOS();
    os.iniciarDiagnostico();
    os.registrarDiagnostico({
      observacao: 'ok',
      itensServicoAdicionais: [],
      itensPecaAdicionais: [],
    });
    os.aprovarOrcamento();

    jest.useFakeTimers().setSystemTime(new Date(Date.now() + 90 * 60_000));
    os.finalizar();
    jest.useRealTimers();

    expect(os.tempoExecucaoMinutos()).toBeGreaterThanOrEqual(89);
  });

  it('retorna null para tempo de execução quando a OS ainda não foi finalizada', () => {
    const os = abrirOS();
    expect(os.tempoExecucaoMinutos()).toBeNull();
  });

  it('restaurar reconstrói o snapshot sem revalidar regras de transição', () => {
    const original = abrirOS();
    const restaurado = OrdemServico.restaurar({
      id: original.id,
      clienteId: original.getClienteId(),
      veiculoId: original.getVeiculoId(),
      status: StatusOrdemServico.ENTREGUE,
      itensServico: [...original.getItensServico()],
      itensPeca: [...original.getItensPeca()],
      observacaoDiagnostico: 'finalizado',
      valorTotal: original.getValorTotal(),
      dataRecebimento: original.getDataRecebimento(),
      dataDiagnostico: new Date(),
      dataAprovacao: new Date(),
      dataInicioExecucao: new Date(),
      dataFinalizacao: new Date(),
      dataEntrega: new Date(),
    });

    expect(restaurado.getStatus()).toBe(StatusOrdemServico.ENTREGUE);
  });
});
