import { DomainException } from '../../../shared/domain/exceptions';

export interface ItemServicoOS {
  servicoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export interface ItemPecaOS {
  pecaId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
}

export function criarItemServico(props: ItemServicoOS): ItemServicoOS {
  if (props.quantidade <= 0) {
    throw new DomainException(
      `Quantidade do serviço "${props.nome}" deve ser positiva`,
    );
  }
  if (props.precoUnitario < 0) {
    throw new DomainException(
      `Preço do serviço "${props.nome}" não pode ser negativo`,
    );
  }
  return { ...props };
}

export function criarItemPeca(props: ItemPecaOS): ItemPecaOS {
  if (props.quantidade <= 0) {
    throw new DomainException(
      `Quantidade da peça "${props.nome}" deve ser positiva`,
    );
  }
  if (props.precoUnitario < 0) {
    throw new DomainException(
      `Preço da peça "${props.nome}" não pode ser negativo`,
    );
  }
  return { ...props };
}

export function subtotalServico(item: ItemServicoOS): number {
  return item.precoUnitario * item.quantidade;
}

export function subtotalPeca(item: ItemPecaOS): number {
  return item.precoUnitario * item.quantidade;
}
