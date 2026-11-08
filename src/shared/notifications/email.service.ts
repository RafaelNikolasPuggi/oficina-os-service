import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(configService: ConfigService<AppConfig, true>) {
    const smtp = configService.get('smtp', { infer: true });
    this.from = smtp.from;
    this.transporter = createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }

  /**
   * Envia a notificação e nunca propaga falha para quem chamou — um problema
   * no envio de e-mail não pode impedir a transição de status da OS.
   */
  async enviarAtualizacaoDeStatus(
    destinatario: string,
    assunto: string,
    mensagem: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: destinatario,
        subject: assunto,
        text: mensagem,
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao enviar e-mail de notificação para ${destinatario}: ${String(error)}`,
      );
    }
  }
}
