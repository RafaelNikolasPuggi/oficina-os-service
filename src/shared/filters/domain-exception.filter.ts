import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  DuplicateEntityException,
  EntityNotFoundException,
  InsufficientStockException,
  InvalidDocumentException,
  InvalidPlacaException,
  InvalidStatusTransitionException,
} from '../domain/exceptions';

/**
 * Traduz exceções de domínio (regras de negócio violadas) para respostas HTTP
 * com o status semanticamente correto, mantendo o domínio livre de qualquer
 * conhecimento sobre o transporte HTTP.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.resolveStatus(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveStatus(exception: DomainException): number {
    if (exception instanceof EntityNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof DuplicateEntityException) {
      return HttpStatus.CONFLICT;
    }
    if (
      exception instanceof InvalidDocumentException ||
      exception instanceof InvalidPlacaException ||
      exception instanceof InvalidStatusTransitionException ||
      exception instanceof InsufficientStockException
    ) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }
    return HttpStatus.BAD_REQUEST;
  }
}
