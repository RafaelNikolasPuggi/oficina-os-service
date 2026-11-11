import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { HttpProducaoServiceClient } from './producao-service.client';

describe('HttpProducaoServiceClient', () => {
  let client: HttpProducaoServiceClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    const configService = {
      get: jest.fn(() => ({ url: 'http://producao-service.local' })),
    } as unknown as ConfigService;
    client = new HttpProducaoServiceClient(configService);

    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('buscarServicosPorIds devolve [] sem chamar a rede quando a lista é vazia', async () => {
    const resultado = await client.buscarServicosPorIds([]);

    expect(resultado).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('buscarServicosPorIds faz POST e devolve o corpo da resposta', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'servico-1', nome: 'Troca de óleo', preco: 150 },
      ],
    });

    const resultado = await client.buscarServicosPorIds(['servico-1']);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://producao-service.local/servicos/buscar-por-ids',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(resultado).toEqual([
      { id: 'servico-1', nome: 'Troca de óleo', preco: 150 },
    ]);
  });

  it('buscarPecasPorIds devolve [] sem chamar a rede quando a lista é vazia', async () => {
    const resultado = await client.buscarPecasPorIds([]);

    expect(resultado).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lança ServiceUnavailableException quando a resposta não é ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });

    await expect(client.buscarPecasPorIds(['peca-1'])).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('lança ServiceUnavailableException quando a chamada de rede falha', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(client.buscarPecasPorIds(['peca-1'])).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
