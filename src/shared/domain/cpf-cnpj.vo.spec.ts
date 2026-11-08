import { InvalidDocumentException } from './exceptions';
import { CpfCnpj } from './cpf-cnpj.vo';

describe('CpfCnpj', () => {
  it('aceita um CPF válido e identifica o tipo corretamente', () => {
    const doc = CpfCnpj.criar('111.444.777-35');
    expect(doc.getValor()).toBe('11144477735');
    expect(doc.getTipo()).toBe('CPF');
  });

  it('aceita um CNPJ válido e identifica o tipo corretamente', () => {
    const doc = CpfCnpj.criar('11.222.333/0001-81');
    expect(doc.getValor()).toBe('11222333000181');
    expect(doc.getTipo()).toBe('CNPJ');
  });

  it('rejeita CPF com dígito verificador inválido', () => {
    expect(() => CpfCnpj.criar('111.444.777-36')).toThrow(
      InvalidDocumentException,
    );
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(() => CpfCnpj.criar('111.111.111-11')).toThrow(
      InvalidDocumentException,
    );
  });

  it('rejeita CNPJ com dígito verificador inválido', () => {
    expect(() => CpfCnpj.criar('11.222.333/0001-82')).toThrow(
      InvalidDocumentException,
    );
  });

  it('rejeita documento com tamanho inválido', () => {
    expect(() => CpfCnpj.criar('123')).toThrow(InvalidDocumentException);
  });

  it('isValid retorna booleano sem lançar exceção', () => {
    expect(CpfCnpj.isValid('111.444.777-35')).toBe(true);
    expect(CpfCnpj.isValid('000.000.000-00')).toBe(false);
  });

  it('equals compara dois documentos pelo valor numérico', () => {
    const a = CpfCnpj.criar('111.444.777-35');
    const b = CpfCnpj.criar('11144477735');
    expect(a.equals(b)).toBe(true);
  });

  it('formatado devolve o CPF com máscara', () => {
    const doc = CpfCnpj.criar('11144477735');
    expect(doc.formatado()).toBe('111.444.777-35');
  });
});
