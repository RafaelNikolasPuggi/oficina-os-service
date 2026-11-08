export enum StatusOrdemServico {
  RECEBIDA = 'RECEBIDA',
  EM_DIAGNOSTICO = 'EM_DIAGNOSTICO',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  FINALIZADA = 'FINALIZADA',
  ENTREGUE = 'ENTREGUE',
  RECUSADA = 'RECUSADA',
}

/**
 * Ordem de prioridade da listagem operacional (Fase 2): Em Execução é o mais
 * urgente, Recebida o menos. Usada apenas quando nenhum filtro de status é
 * informado — dentro de cada status, a ordenação secundária é sempre pelas
 * OS mais antigas primeiro.
 */
export const PRIORIDADE_STATUS_LISTAGEM: readonly StatusOrdemServico[] = [
  StatusOrdemServico.EM_EXECUCAO,
  StatusOrdemServico.AGUARDANDO_APROVACAO,
  StatusOrdemServico.EM_DIAGNOSTICO,
  StatusOrdemServico.RECEBIDA,
];

/** Status excluídos (exclusão lógica) da listagem operacional padrão. */
export const STATUS_OCULTOS_DA_LISTAGEM_PADRAO: readonly StatusOrdemServico[] =
  [StatusOrdemServico.FINALIZADA, StatusOrdemServico.ENTREGUE];

const TRANSICOES_VALIDAS: Record<StatusOrdemServico, StatusOrdemServico[]> = {
  [StatusOrdemServico.RECEBIDA]: [StatusOrdemServico.EM_DIAGNOSTICO],
  [StatusOrdemServico.EM_DIAGNOSTICO]: [
    StatusOrdemServico.AGUARDANDO_APROVACAO,
  ],
  [StatusOrdemServico.AGUARDANDO_APROVACAO]: [
    StatusOrdemServico.EM_EXECUCAO,
    StatusOrdemServico.RECUSADA,
  ],
  [StatusOrdemServico.EM_EXECUCAO]: [StatusOrdemServico.FINALIZADA],
  [StatusOrdemServico.FINALIZADA]: [StatusOrdemServico.ENTREGUE],
  [StatusOrdemServico.ENTREGUE]: [],
  [StatusOrdemServico.RECUSADA]: [],
};

export function podeTransicionar(
  de: StatusOrdemServico,
  para: StatusOrdemServico,
): boolean {
  return TRANSICOES_VALIDAS[de].includes(para);
}
