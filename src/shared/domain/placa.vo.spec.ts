import { InvalidPlacaException } from './exceptions';
import { Placa } from './placa.vo';

describe('Placa', () => {
  it('aceita o formato antigo (AAA9999)', () => {
    const placa = Placa.criar('abc1234');
    expect(placa.getValor()).toBe('ABC1234');
  });

  it('aceita o formato Mercosul (AAA9A99)', () => {
    const placa = Placa.criar('abc1d23');
    expect(placa.getValor()).toBe('ABC1D23');
  });

  it('normaliza espaços e hífens', () => {
    const placa = Placa.criar('ABC-1234');
    expect(placa.getValor()).toBe('ABC1234');
  });

  it('rejeita placa em formato inválido', () => {
    expect(() => Placa.criar('AB1234')).toThrow(InvalidPlacaException);
    expect(() => Placa.criar('ABCD123')).toThrow(InvalidPlacaException);
  });

  it('isValid retorna booleano sem lançar exceção', () => {
    expect(Placa.isValid('ABC1234')).toBe(true);
    expect(Placa.isValid('XYZ')).toBe(false);
  });

  it('equals compara duas placas pelo valor normalizado', () => {
    const a = Placa.criar('abc1234');
    const b = Placa.criar('ABC-1234');
    expect(a.equals(b)).toBe(true);
  });
});
