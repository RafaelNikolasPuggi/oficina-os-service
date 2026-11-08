import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../../config/configuration';

export interface ClienteJwtPayload {
  sub: string; // clienteId
  documento: string;
  tipo: 'cliente';
}

/**
 * Valida os tokens emitidos pela Function Serverless de autenticação por CPF
 * (repositório `oficina-lambda-auth`, Fase 3) — mesmo `JWT_SECRET`,
 * compartilhado via SSM Parameter Store entre os dois repositórios.
 */
@Injectable()
export class ClienteJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-cliente',
) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).secret,
    });
  }

  validate(payload: ClienteJwtPayload): ClienteJwtPayload {
    if (payload.tipo !== 'cliente') {
      throw new UnauthorizedException('Token não é válido para esta rota');
    }
    return payload;
  }
}
