export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidDocumentException extends DomainException {
  constructor(documento: string) {
    super(`Documento inválido: ${documento}`);
  }
}

export class InvalidPlacaException extends DomainException {
  constructor(placa: string) {
    super(`Placa de veículo inválida: ${placa}`);
  }
}

export class InvalidStatusTransitionException extends DomainException {
  constructor(de: string, para: string) {
    super(
      `Transição de status inválida: não é possível ir de "${de}" para "${para}"`,
    );
  }
}

export class InsufficientStockException extends DomainException {
  constructor(pecaNome: string, disponivel: number, solicitado: number) {
    super(
      `Estoque insuficiente para a peça "${pecaNome}": disponível ${disponivel}, solicitado ${solicitado}`,
    );
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entidade: string, id: string) {
    super(`${entidade} não encontrado(a) para o id "${id}"`);
  }
}

export class DuplicateEntityException extends DomainException {
  constructor(entidade: string, campo: string, valor: string) {
    super(`${entidade} já existe com ${campo} "${valor}"`);
  }
}
