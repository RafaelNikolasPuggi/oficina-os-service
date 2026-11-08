import { AsyncLocalStorage } from 'async_hooks';
import { ConsoleLogger, Injectable } from '@nestjs/common';

/** Guarda o id de correlação da requisição atual entre chamadas assíncronas. */
export const requestIdStorage = new AsyncLocalStorage<string>();

/**
 * Logger estruturado em JSON (um objeto por linha via `ConsoleLoggerOptions.json`,
 * suporte nativo do Nest), exigido pela Fase 3 para permitir correlação de
 * requisições e ingestão por ferramentas de observabilidade (New Relic).
 * Quando o APM está ativo (`NEW_RELIC_ENABLED`), cada linha carrega
 * `trace.id`/`span.id`/`entity.guid` (formato que o New Relic espera para
 * correlacionar log ↔ trace automaticamente), via
 * `newrelic.getLinkingMetadata()`.
 */
@Injectable()
export class JsonLoggerService extends ConsoleLogger {
  constructor() {
    super({ json: true });
  }

  protected getJsonLogObject(
    message: unknown,
    options: Parameters<ConsoleLogger['getJsonLogObject']>[1],
  ): ReturnType<ConsoleLogger['getJsonLogObject']> & Record<string, unknown> {
    const logObject: ReturnType<ConsoleLogger['getJsonLogObject']> &
      Record<string, unknown> = super.getJsonLogObject(message, options);

    const requestId = requestIdStorage.getStore();
    if (requestId) logObject.requestId = requestId;

    if (process.env.NEW_RELIC_ENABLED === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const newrelic = require('newrelic') as typeof import('newrelic');
      Object.assign(logObject, newrelic.getLinkingMetadata());
    }

    return logObject;
  }
}
