import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate devolve o payload tal como recebido', () => {
    const configService = {
      get: jest.fn(() => ({ secret: 'dev-secret' })),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(configService);

    const payload = {
      sub: 'admin-1',
      email: 'admin@oficina.com',
      nome: 'Admin',
    };

    expect(strategy.validate(payload)).toBe(payload);
  });
});
