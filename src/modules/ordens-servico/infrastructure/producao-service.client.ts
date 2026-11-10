import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';

export const PRODUCAO_SERVICE_CLIENT = Symbol('PRODUCAO_SERVICE_CLIENT');

export interface ServicoCatalogo {
  id: string;
  nome: string;
  preco: number;
}

export interface PecaCatalogo {
  id: string;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
}

/**
 * Cliente HTTP para o `oficina-producao-service` (dono do catálogo de
 * serviços/peças e do estoque desde a Fase 4). O `os-service` nunca acessa
 * esse banco diretamente — toda consulta de catálogo passa por aqui.
 *
 * A reserva de estoque em si NÃO é mais uma chamada síncrona daqui — é o
 * primeiro passo assíncrono da Saga: ver `SagaEventsPublisher` e
 * `OrdensServicoEventsController`.
 */
export interface ProducaoServiceClient {
  buscarServicosPorIds(ids: string[]): Promise<ServicoCatalogo[]>;
  buscarPecasPorIds(ids: string[]): Promise<PecaCatalogo[]>;
}

@Injectable()
export class HttpProducaoServiceClient implements ProducaoServiceClient {
  private readonly baseUrl: string;

  constructor(
    @Inject(ConfigService)
    configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = configService.get('producaoService', { infer: true }).url;
  }

  async buscarServicosPorIds(ids: string[]): Promise<ServicoCatalogo[]> {
    if (ids.length === 0) return [];
    return this.post<ServicoCatalogo[]>('/servicos/buscar-por-ids', { ids });
  }

  async buscarPecasPorIds(ids: string[]): Promise<PecaCatalogo[]> {
    if (ids.length === 0) return [];
    return this.post<PecaCatalogo[]>('/pecas/buscar-por-ids', { ids });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {
      throw new ServiceUnavailableException('Serviço de produção indisponível');
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('Serviço de produção indisponível');
    }
    return response.json() as Promise<T>;
  }
}
