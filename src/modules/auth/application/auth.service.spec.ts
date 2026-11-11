import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../domain/usuario.entity';
import type { UsuarioRepository } from '../domain/usuario.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let jwtService: { signAsync: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    usuarioRepository = {
      salvar: jest.fn(),
      buscarPorEmail: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token-assinado') };

    service = new AuthService(usuarioRepository, jwtService as never);
  });

  it('autentica e devolve um accessToken quando a senha está correta', async () => {
    const usuario = Usuario.criar({
      id: 'admin-1',
      nome: 'Administrador',
      email: 'admin@oficina.com',
      senhaHash: await bcrypt.hash('SenhaForte123', 10),
    });
    usuarioRepository.buscarPorEmail.mockResolvedValueOnce(usuario);

    const resultado = await service.login('admin@oficina.com', 'SenhaForte123');

    expect(resultado.accessToken).toBe('token-assinado');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'admin-1',
      email: 'admin@oficina.com',
      nome: 'Administrador',
    });
  });

  it('lança UnauthorizedException quando o usuário não existe', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValueOnce(null);

    await expect(
      service.login('inexistente@oficina.com', 'qualquer'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lança UnauthorizedException quando a senha está incorreta', async () => {
    const usuario = Usuario.criar({
      id: 'admin-1',
      nome: 'Administrador',
      email: 'admin@oficina.com',
      senhaHash: await bcrypt.hash('SenhaForte123', 10),
    });
    usuarioRepository.buscarPorEmail.mockResolvedValueOnce(usuario);

    await expect(
      service.login('admin@oficina.com', 'senha-errada'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
