import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { requestIdStorage } from './json-logger.service';

const HEADER = 'x-request-id';

/**
 * Correlação de requisições (Fase 3): reaproveita o `x-request-id` recebido
 * (ex.: injetado pelo API Gateway) ou gera um novo, devolve no header de
 * resposta, e disponibiliza para o `JsonLoggerService` anexar em todo log
 * emitido durante essa requisição — sem precisar passá-lo manualmente por
 * cada camada.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers[HEADER] as string | undefined) ?? randomUUID();
    res.setHeader(HEADER, requestId);
    requestIdStorage.run(requestId, next);
  }
}
