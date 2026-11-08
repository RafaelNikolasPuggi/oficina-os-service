import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClienteJwtPayload } from '../strategies/cliente-jwt.strategy';

interface RequestComCliente {
  user: ClienteJwtPayload;
}

/** Extrai o clienteId (`sub`) do JWT validado pelo ClienteAuthGuard. */
export const ClienteAtual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestComCliente>();
    return request.user.sub;
  },
);
