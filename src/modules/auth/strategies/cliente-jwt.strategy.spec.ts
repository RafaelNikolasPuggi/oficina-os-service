import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { ClienteJwtStrategy } from './cliente-jwt.strategy';

describe('ClienteJwtStrategy', () => {
  function criarStrategy(): ClienteJwtStrategy {
    const configService = {
      get: jest.fn(() => ({ secret: 'dev-secret' })),
    } as unknown as ConfigService;
    return new ClienteJwtStrategy(configService);
  }

  it('validate devolve o payload quando tipo é "cliente"', () => {
    const strategy = criarStrategy();
    const payload = {
      sub: 'cliente-1',
      documento: '11144477735',
      tipo: 'cliente' as const,
    };

    expect(strategy.validate(payload)).toBe(payload);
  });

  it('lança UnauthorizedException quando o token não é de cliente', () => {
    const strategy = criarStrategy();

    expect(() =>
      strategy.validate({
        sub: 'admin-1',
        documento: '',
        tipo: 'outro' as never,
      }),
    ).toThrow(UnauthorizedException);
  });
});
