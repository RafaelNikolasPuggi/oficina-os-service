import { requestIdStorage } from './json-logger.service';
import { RequestIdMiddleware } from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let setHeader: jest.Mock;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    setHeader = jest.fn();
    next = jest.fn();
  });

  it('reaproveita o x-request-id recebido na requisição', () => {
    const req = { headers: { 'x-request-id': 'id-existente' } };
    const res = { setHeader };

    middleware.use(req as never, res as never, next);

    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'id-existente');
    expect(next).toHaveBeenCalled();
  });

  it('gera um novo id quando a requisição não traz um', () => {
    const req = { headers: {} };
    const res = { setHeader };

    middleware.use(req as never, res as never, next);

    const idGerado = setHeader.mock.calls[0][1] as string;
    expect(typeof idGerado).toBe('string');
    expect(idGerado.length).toBeGreaterThan(0);
  });

  it('disponibiliza o request id no AsyncLocalStorage durante o next()', () => {
    const req = { headers: { 'x-request-id': 'id-123' } };
    const res = { setHeader };
    let capturado: string | undefined;
    next.mockImplementation(() => {
      capturado = requestIdStorage.getStore();
    });

    middleware.use(req as never, res as never, next);

    expect(capturado).toBe('id-123');
  });
});
