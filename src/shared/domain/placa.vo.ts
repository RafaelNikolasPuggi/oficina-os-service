import { InvalidPlacaException } from './exceptions';

const PLACA_ANTIGA = /^[A-Z]{3}[0-9]{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

/**
 * Value Object que representa a placa de um Veículo.
 * Aceita o formato antigo (AAA9999) e o formato Mercosul (AAA9A99).
 */
export class Placa {
  private readonly valor: string;

  private constructor(valor: string) {
    this.valor = valor;
  }

  static criar(placa: string): Placa {
    const normalizada = (placa ?? '').replace(/[\s-]/g, '').toUpperCase();

    if (!PLACA_ANTIGA.test(normalizada) && !PLACA_MERCOSUL.test(normalizada)) {
      throw new InvalidPlacaException(placa);
    }

    return new Placa(normalizada);
  }

  static isValid(placa: string): boolean {
    try {
      Placa.criar(placa);
      return true;
    } catch {
      return false;
    }
  }

  getValor(): string {
    return this.valor;
  }

  equals(other: Placa): boolean {
    return this.valor === other.valor;
  }
}
