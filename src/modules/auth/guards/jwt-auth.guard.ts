import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege as rotas administrativas exigindo um token JWT válido.
 * As rotas voltadas ao cliente final (consulta de status, aprovação de
 * orçamento) permanecem públicas e são validadas por CPF/CNPJ + id da OS.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
