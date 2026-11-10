import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdensServicoService } from '../../application/ordens-servico.service';

interface PecasReservadasEvent {
  ordemServicoId: string;
}

interface ReservaDePecasFalhouEvent {
  ordemServicoId: string;
  pecaNome: string;
  disponivel: number;
  solicitado: number;
}

interface PagamentoAprovadoEvent {
  ordemServicoId: string;
}

interface PagamentoRejeitadoEvent {
  ordemServicoId: string;
}

/**
 * Lado "orquestrador" da Saga: reage ao que producao-service e
 * pagamento-service publicam de volta na fila `os_queue`. Nenhum desses
 * handlers lança para fora — um erro aqui (ex.: OS já removida) só é
 * logado, porque não há para quem devolver uma resposta HTTP.
 */
@Controller()
export class OrdensServicoEventsController {
  private readonly logger = new Logger(OrdensServicoEventsController.name);

  constructor(private readonly ordensServicoService: OrdensServicoService) {}

  @EventPattern('pecas.reservadas')
  async aoReservarPecas(
    @Payload() evento: PecasReservadasEvent,
  ): Promise<void> {
    await this.ordensServicoService
      .confirmarReservaDePecas(evento.ordemServicoId)
      .catch((error: Error) =>
        this.logger.error(
          `Falha ao confirmar reserva de peças da OS ${evento.ordemServicoId}: ${error.message}`,
        ),
      );
  }

  @EventPattern('reserva.pecas.falhou')
  async aoFalharReservaDePecas(
    @Payload() evento: ReservaDePecasFalhouEvent,
  ): Promise<void> {
    await this.ordensServicoService
      .registrarFalhaReservaDePecas(evento)
      .catch((error: Error) =>
        this.logger.error(
          `Falha ao registrar falta de estoque da OS ${evento.ordemServicoId}: ${error.message}`,
        ),
      );
  }

  @EventPattern('pagamento.aprovado')
  async aoAprovarPagamento(
    @Payload() evento: PagamentoAprovadoEvent,
  ): Promise<void> {
    await this.ordensServicoService
      .confirmarPagamento(evento.ordemServicoId)
      .catch((error: Error) =>
        this.logger.error(
          `Falha ao confirmar pagamento da OS ${evento.ordemServicoId}: ${error.message}`,
        ),
      );
  }

  @EventPattern('pagamento.rejeitado')
  async aoRejeitarPagamento(
    @Payload() evento: PagamentoRejeitadoEvent,
  ): Promise<void> {
    await this.ordensServicoService
      .rejeitarPagamento(evento.ordemServicoId)
      .catch((error: Error) =>
        this.logger.error(
          `Falha ao registrar rejeição de pagamento da OS ${evento.ordemServicoId}: ${error.message}`,
        ),
      );
  }
}
