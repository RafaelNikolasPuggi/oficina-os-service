import { OrdemServico } from '../domain/ordem-servico.entity';
import { StatusOrdemServico } from '../domain/status-ordem-servico.enum';
import { OrdemServicoMapper } from './ordem-servico.mapper';
import { OrdemServicoOrmEntity } from './ordem-servico.orm-entity';

describe('OrdemServicoMapper', () => {
  it('converte de domínio para ORM', () => {
    const os = OrdemServico.abrir({
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
      itensPeca: [],
    });

    const orm = OrdemServicoMapper.toOrm(os);

    expect(orm.id).toBe('os-1');
    expect(orm.clienteId).toBe('cliente-1');
    expect(orm.status).toBe(StatusOrdemServico.RECEBIDA);
    expect(orm.valorTotal).toBe('150.00');
    expect(orm.pagamentoConfirmado).toBe(false);
  });

  it('converte de ORM para domínio (round-trip preserva estado)', () => {
    const orm = new OrdemServicoOrmEntity();
    orm.id = 'os-1';
    orm.clienteId = 'cliente-1';
    orm.veiculoId = 'veiculo-1';
    orm.status = StatusOrdemServico.FINALIZADA;
    orm.itensServico = [];
    orm.itensPeca = [];
    orm.observacaoDiagnostico = 'ok';
    orm.valorTotal = '270.00';
    orm.dataRecebimento = new Date('2026-01-01T00:00:00Z');
    orm.dataDiagnostico = new Date('2026-01-01T01:00:00Z');
    orm.dataAprovacao = new Date('2026-01-01T02:00:00Z');
    orm.dataInicioExecucao = new Date('2026-01-01T02:00:00Z');
    orm.dataFinalizacao = new Date('2026-01-01T03:00:00Z');
    orm.dataEntrega = null;
    orm.pagamentoConfirmado = true;

    const os = OrdemServicoMapper.toDomain(orm);

    expect(os.getStatus()).toBe(StatusOrdemServico.FINALIZADA);
    expect(os.getValorTotal()).toBe(270);
    expect(os.getPagamentoConfirmado()).toBe(true);
    expect(() => os.entregar()).not.toThrow();
  });
});
