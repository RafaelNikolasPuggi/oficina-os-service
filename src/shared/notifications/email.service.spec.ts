import { ConfigService } from '@nestjs/config';

const sendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail })),
}));

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    sendMail.mockReset();
    const configService = {
      get: jest.fn(() => ({
        host: 'localhost',
        port: 1025,
        secure: false,
        user: undefined,
        pass: undefined,
        from: 'oficina@example.com',
      })),
    } as unknown as ConfigService;

    service = new EmailService(configService);
  });

  it('envia o e-mail com os dados informados', async () => {
    sendMail.mockResolvedValueOnce(undefined);

    await service.enviarAtualizacaoDeStatus(
      'cliente@email.com',
      'Assunto',
      'Mensagem',
    );

    expect(sendMail).toHaveBeenCalledWith({
      from: 'oficina@example.com',
      to: 'cliente@email.com',
      subject: 'Assunto',
      text: 'Mensagem',
    });
  });

  it('não lança quando o envio falha', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP indisponível'));

    await expect(
      service.enviarAtualizacaoDeStatus('cliente@email.com', 'Assunto', 'Msg'),
    ).resolves.toBeUndefined();
  });
});
