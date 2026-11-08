import { Entity } from '../../../shared/domain/entity.base';
import { Placa } from '../../../shared/domain/placa.vo';
import { DomainException } from '../../../shared/domain/exceptions';

export interface VeiculoProps {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export class Veiculo extends Entity {
  private readonly clienteId: string;
  private readonly placa: Placa;
  private marca: string;
  private modelo: string;
  private ano: number;

  private constructor(
    id: string,
    clienteId: string,
    placa: Placa,
    marca: string,
    modelo: string,
    ano: number,
  ) {
    super(id);
    this.clienteId = clienteId;
    this.placa = placa;
    this.marca = marca;
    this.modelo = modelo;
    this.ano = ano;
  }

  static criar(props: VeiculoProps): Veiculo {
    const anoAtual = new Date().getFullYear();
    if (!props.ano || props.ano < 1950 || props.ano > anoAtual + 1) {
      throw new DomainException(`Ano do veículo inválido: ${props.ano}`);
    }
    if (!props.marca?.trim() || !props.modelo?.trim()) {
      throw new DomainException('Marca e modelo do veículo são obrigatórios');
    }

    return new Veiculo(
      props.id,
      props.clienteId,
      Placa.criar(props.placa),
      props.marca.trim(),
      props.modelo.trim(),
      props.ano,
    );
  }

  atualizar(dados: { marca?: string; modelo?: string; ano?: number }): void {
    if (dados.marca !== undefined) this.marca = dados.marca.trim();
    if (dados.modelo !== undefined) this.modelo = dados.modelo.trim();
    if (dados.ano !== undefined) this.ano = dados.ano;
  }

  getClienteId(): string {
    return this.clienteId;
  }

  getPlaca(): Placa {
    return this.placa;
  }

  getMarca(): string {
    return this.marca;
  }

  getModelo(): string {
    return this.modelo;
  }

  getAno(): number {
    return this.ano;
  }
}
