import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege as rotas voltadas ao cliente final (consulta de status, aprovação
 * de orçamento) exigindo o JWT emitido pela Lambda de autenticação por CPF
 * (Fase 3) — substitui a validação de CPF/CNPJ por requisição usada nas
 * Fases 1/2.
 */
@Injectable()
export class ClienteAuthGuard extends AuthGuard('jwt-cliente') {}
