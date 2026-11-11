import { AppController } from './app.controller';

describe('AppController', () => {
  it('health devolve status ok com timestamp', () => {
    const controller = new AppController();

    const resultado = controller.health();

    expect(resultado.status).toBe('ok');
    expect(typeof resultado.timestamp).toBe('string');
  });
});
