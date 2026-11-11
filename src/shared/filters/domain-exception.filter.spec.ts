import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  DuplicateEntityException,
  EntityNotFoundException,
  InsufficientStockException,
  InvalidDocumentException,
  InvalidPlacaException,
  InvalidStatusTransitionException,
} from '../domain/exceptions';
import { DomainExceptionFilter } from './domain-exception.filter';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: { switchToHttp: () => { getResponse: () => unknown } };

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    };
  });

  it.each([
    [new EntityNotFoundException('Cliente', '1'), HttpStatus.NOT_FOUND],
    [
      new DuplicateEntityException('Cliente', 'documento', '123'),
      HttpStatus.CONFLICT,
    ],
    [new InvalidDocumentException('123'), HttpStatus.UNPROCESSABLE_ENTITY],
    [new InvalidPlacaException('ABC'), HttpStatus.UNPROCESSABLE_ENTITY],
    [
      new InvalidStatusTransitionException('A', 'B'),
      HttpStatus.UNPROCESSABLE_ENTITY,
    ],
    [
      new InsufficientStockException('Peça', 1, 2),
      HttpStatus.UNPROCESSABLE_ENTITY,
    ],
    [new DomainException('genérico'), HttpStatus.BAD_REQUEST],
  ])('mapeia %p para o status %i', (exception, expectedStatus) => {
    filter.catch(exception, host as never);

    expect(status).toHaveBeenCalledWith(expectedStatus);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expectedStatus,
        error: exception.name,
        message: exception.message,
      }),
    );
  });
});
