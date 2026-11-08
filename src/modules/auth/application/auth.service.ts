import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY } from '../domain/usuario.repository';
import type { UsuarioRepository } from '../domain/usuario.repository';

export interface JwtPayload {
  sub: string;
  email: string;
  nome: string;
}

export interface LoginOutput {
  accessToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string): Promise<LoginOutput> {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.getSenhaHash());
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.getEmail(),
      nome: usuario.getNome(),
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
  }
}
