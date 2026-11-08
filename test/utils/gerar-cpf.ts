function calcularDigito(numeros: number[]): number {
  let soma = 0;
  let peso = numeros.length + 1;
  for (const n of numeros) {
    soma += n * peso;
    peso--;
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/** Gera um CPF numericamente válido e aleatório, usado apenas para massa de teste. */
export function gerarCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1 = calcularDigito(base);
  const d2 = calcularDigito([...base, d1]);
  return [...base, d1, d2].join('');
}

/** Gera uma placa Mercosul válida e aleatória, usada apenas para massa de teste. */
export function gerarPlaca(): string {
  const letras = () =>
    Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ).join('');
  const digito = () => Math.floor(Math.random() * 10);
  const letra = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${letras()}${digito()}${letra()}${digito()}${digito()}`;
}
