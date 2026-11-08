import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
import { InsufficientStockException } from '../../../shared/domain/exceptions';

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

export interface ReservarPecaInput {
  pecaId: string;
  quantidade: number;
}

/**
 * Cliente HTTP para o `oficina-producao-service` (dono do catálogo de
 * serviços/peças e do estoque desde a Fase 4). O `os-service` nunca acessa
 * esse banco diretamente — toda consulta ou reserva de estoque passa por
 * aqui.
 *
 * `reservarPecas` hoje é síncrono (chamada REST direta); vira o primeiro
 * passo assíncrono da Saga (publicação de `OrcamentoAprovado` via RabbitMQ)
 * na próxima etapa do projeto.
 */
export interface ProducaoServiceClient {
  buscarServicosPorIds(ids: string[]): Promise<ServicoCatalogo[]>;
  buscarPecasPorIds(ids: string[]): Promise<PecaCatalogo[]>;
  reservarPecas(itens: ReservarPecaInput[]): Promise<void>;
}

interface ReservaRecusadaBody {
  pecaNome: string;
  disponivel: number;
  solicitado: number;
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

  async reservarPecas(itens: ReservarPecaInput[]): Promise<void> {
    if (itens.length === 0) return;

    const response = await fetch(`${this.baseUrl}/pecas/reservar-estoque`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itens }),
    }).catch(() => {
      throw new ServiceUnavailableException(
        'Serviço de produção indisponível ao reservar estoque',
      );
    });

    if (response.status === 409) {
      const body = (await response.json()) as ReservaRecusadaBody;
      throw new InsufficientStockException(
        body.pecaNome,
        body.disponivel,
        body.solicitado,
      );
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Serviço de produção indisponível ao reservar estoque',
      );
    }
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
