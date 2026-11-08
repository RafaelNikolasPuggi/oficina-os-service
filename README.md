# oficina-os-service

Microsserviço de **Ordens de Serviço** do sistema de gestão da oficina — Tech Challenge Fase 4 (POS TECH / SOAT).

Parte de uma arquitetura de 3 microsserviços, cada um com seu próprio repositório e banco de dados:

| Serviço | Repositório | Banco |
|---|---|---|
| **OS Service** (este repo) | `oficina-os-service` | PostgreSQL |
| Produção | [oficina-producao-service](https://github.com/RafaelNikolasPuggi/oficina-producao-service) | PostgreSQL |
| Pagamento | [oficina-pagamento-service](https://github.com/RafaelNikolasPuggi/oficina-pagamento-service) | MongoDB |

O monólito da Fase 3 foi preservado intacto como backup em [oficina-tech-challenge](https://github.com/RafaelNikolasPuggi/oficina-tech-challenge) / clone de trabalho [fase4-oficina-tech-challenge](https://github.com/RafaelNikolasPuggi/fase4-oficina-tech-challenge).

## O que este serviço possui

- **Clientes** e **Veículos** (dados mestres, cadastro)
- **Ordens de Serviço** — agregado central com a máquina de estados (`RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO → EM_EXECUCAO → FINALIZADA → ENTREGUE`, com `RECUSADA` como saída)
- **Auth**: login administrativo (JWT próprio) + validação (stateless) do JWT de cliente emitido pela `oficina-lambda-auth`
- **Orquestração da Saga**: este serviço é o orquestrador do fluxo "aprovação de orçamento → reserva de peças → execução → finalização → pagamento → entrega" (RabbitMQ — em implementação)

Nunca acessa o banco de **Produção** ou **Pagamento** diretamente — toda interação é via REST (síncrono, hoje) ou mensageria (assíncrono, Saga).

## Rodando localmente

```bash
cp .env.example .env
docker compose up -d postgres mailhog
npm install
npm run start:dev
```

Swagger em `http://localhost:3000/docs`. Requer o `oficina-producao-service` rodando em `PRODUCAO_SERVICE_URL` (padrão `http://localhost:3001`) para resolver itens de serviço/peça.

## Testes

```bash
npm test          # unitários
npm run test:cov  # com cobertura
```

## Status

Em construção — extraído do monólito da Fase 3. Próximas etapas: mensageria (RabbitMQ) para a Saga, Terraform/K8s/CI-CD próprios, New Relic.
