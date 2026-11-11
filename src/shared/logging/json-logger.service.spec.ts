import { JsonLoggerService, requestIdStorage } from './json-logger.service';

describe('JsonLoggerService', () => {
  let logger: JsonLoggerService;

  beforeEach(() => {
    logger = new JsonLoggerService();
  });

  function getJsonLogObject(message: string): Record<string, unknown> {
    // getJsonLogObject é protected — acessado via cast só no teste.
    return (
      logger as unknown as {
        getJsonLogObject: (
          message: string,
          options: unknown,
        ) => Record<string, unknown>;
      }
    ).getJsonLogObject(message, { logLevel: 'log', timestamp: Date.now() });
  }

  it('anexa o requestId do AsyncLocalStorage quando presente', () => {
    let logObject: Record<string, unknown> = {};
    requestIdStorage.run('req-123', () => {
      logObject = getJsonLogObject('mensagem');
    });

    expect(logObject.requestId).toBe('req-123');
  });

  it('não anexa requestId quando não há contexto de requisição', () => {
    const logObject = getJsonLogObject('mensagem');

    expect(logObject.requestId).toBeUndefined();
  });
});
