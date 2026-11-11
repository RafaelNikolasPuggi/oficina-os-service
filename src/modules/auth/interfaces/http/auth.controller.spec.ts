import type { AuthService } from '../../application/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;
  let controller: AuthController;

  beforeEach(() => {
    authService = { login: jest.fn() };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('login delega pro service com email e senha do DTO', async () => {
    authService.login.mockResolvedValueOnce({
      accessToken: 'token-123',
      expiresIn: '1h',
    });

    const resultado = await controller.login({
      email: 'admin@oficina.com',
      senha: 'SenhaForte123',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'admin@oficina.com',
      'SenhaForte123',
    );
    expect(resultado.accessToken).toBe('token-123');
  });
});
