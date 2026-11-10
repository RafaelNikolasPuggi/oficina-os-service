import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PAGAMENTO_QUEUE_CLIENT,
  PRODUCAO_QUEUE_CLIENT,
} from '../../../messaging/messaging.module';

export const SAGA_EVENTS_PUBLISHER = Symbol('SAGA_EVENTS_PUBLISHER');

export interface OrcamentoAprovadoEvent {
  ordemServicoId: string;
  itens: { pecaId: string; quantidade: number }[];
}

export interface OsFinalizadaEvent {
  ordemServicoId: string;
  clienteId: string;
  valor: number;
}

/**
 * Publica os eventos que disparam os dois trechos assíncronos da Saga:
 * reserva de estoque (produção) e cobrança (pagamento). O os-service nunca
 * espera a resposta aqui — ela chega depois via
 * `OrdensServicoEventsController`.
 */
export interface SagaEventsPublisher {
  publicarOrcamentoAprovado(evento: OrcamentoAprovadoEvent): void;
  publicarOsFinalizada(evento: OsFinalizadaEvent): void;
}

@Injectable()
export class RabbitMqSagaEventsPublisher implements SagaEventsPublisher {
  constructor(
    @Inject(PRODUCAO_QUEUE_CLIENT) private readonly producaoClient: ClientProxy,
    @Inject(PAGAMENTO_QUEUE_CLIENT)
    private readonly pagamentoClient: ClientProxy,
  ) {}

  publicarOrcamentoAprovado(evento: OrcamentoAprovadoEvent): void {
    this.producaoClient.emit('orcamento.aprovado', evento);
  }

  publicarOsFinalizada(evento: OsFinalizadaEvent): void {
    this.pagamentoClient.emit('os.finalizada', evento);
  }
}
