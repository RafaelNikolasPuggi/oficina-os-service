import { InvalidDocumentException } from './exceptions';

function apenasNumeros(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i], 10) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i], 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf[10], 10);
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calcularDigito = (base: string): number => {
    let peso = base.length - 7;
    let soma = 0;
    for (let i = base.length; i >= 1; i--) {
      soma += parseInt(base.charAt(base.length - i), 10) * peso--;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base12 = cnpj.substring(0, 12);
  const digito1 = calcularDigito(base12);
  if (digito1 !== parseInt(cnpj[12], 10)) return false;

  const base13 = cnpj.substring(0, 13);
  const digito2 = calcularDigito(base13);
  return digito2 === parseInt(cnpj[13], 10);
}

export type TipoDocumento = 'CPF' | 'CNPJ';

/**
 * Value Object que representa o documento (CPF ou CNPJ) de um Cliente.
 * Garante, por invariante, que só é possível existir um documento válido.
 */
export class CpfCnpj {
  private readonly valor: string;
  private readonly tipo: TipoDocumento;

  private constructor(valor: string, tipo: TipoDocumento) {
    this.valor = valor;
    this.tipo = tipo;
  }

  static criar(documento: string): CpfCnpj {
    const numeros = apenasNumeros(documento);

    if (numeros.length === 11) {
      if (!isValidCPF(numeros)) {
        throw new InvalidDocumentException(documento);
      }
      return new CpfCnpj(numeros, 'CPF');
    }

    if (numeros.length === 14) {
      if (!isValidCNPJ(numeros)) {
        throw new InvalidDocumentException(documento);
      }
      return new CpfCnpj(numeros, 'CNPJ');
    }

    throw new InvalidDocumentException(documento);
  }

  static isValid(documento: string): boolean {
    try {
      CpfCnpj.criar(documento);
      return true;
    } catch {
      return false;
    }
  }

  getValor(): string {
    return this.valor;
  }

  getTipo(): TipoDocumento {
    return this.tipo;
  }

  formatado(): string {
    if (this.tipo === 'CPF') {
      return this.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return this.valor.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }

  equals(other: CpfCnpj): boolean {
    return this.valor === other.valor;
  }
}
