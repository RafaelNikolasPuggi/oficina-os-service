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
- **Orquestração da Saga**: este serviço é o orquestrador (via RabbitMQ) do fluxo "aprovação de orçamento → reserva de peças → execução → finalização → pagamento → entrega", com compensação nos dois pontos onde a Saga pode falhar (falta de estoque, pagamento rejeitado) — ver [Saga](#saga-aprovação--execução--pagamento) abaixo.

Nunca acessa o banco de **Produção** ou **Pagamento** diretamente — consulta de catálogo é REST síncrono; a Saga em si é 100% assíncrona via RabbitMQ.

## Saga (aprovação → execução → pagamento)

Este serviço é o **orquestrador**. Filas RabbitMQ: `os_queue` (consumida por aqui), `producao_queue` e `pagamento_queue` (publicadas por aqui).

1. Cliente aprova orçamento → publica `orcamento.aprovado` → OS permanece `AGUARDANDO_APROVACAO`.
2. `producao-service` confirma (`pecas.reservadas`) → OS vai para `EM_EXECUCAO`.
   **Compensação**: se faltar estoque (`reserva.pecas.falhou`), a OS permanece `AGUARDANDO_APROVACAO` e o cliente é notificado — nada para desfazer, pois nada foi reservado ainda.
3. `finalizar()` publica `os.finalizada` → `pagamento-service` cria a cobrança no Mercado Pago.
4. `pagamento-service` confirma (`pagamento.aprovado`) → `entregar()` passa a ser permitido.
   **Compensação**: se o pagamento for rejeitado (`pagamento.rejeitado`), a OS permanece `FINALIZADA` (o serviço já foi executado, não há o que desfazer fisicamente) e bloqueada para entrega até uma nova cobrança.

## Rodando localmente

```bash
cp .env.example .env
docker compose up -d postgres mailhog rabbitmq
npm install
npm run start:dev
```

Swagger em `http://localhost:3000/docs`. Requer o `oficina-producao-service` rodando em `PRODUCAO_SERVICE_URL` (padrão `http://localhost:3001`) para resolver itens de serviço/peça, e o mesmo RabbitMQ (`RABBITMQ_URL`) configurado nos 3 serviços para a Saga funcionar.

## Testes

```bash
npm test          # unitários
npm run test:cov  # com cobertura (gate de CI: mínimo 80% de linhas)
npm run test:bdd  # BDD (Gherkin) da Saga completa — ver test/features/
npm run test:e2e  # e2e (precisa de Postgres rodando)
```

O BDD (`test/features/saga-ordem-servico.feature` + `test/bdd/*.steps.ts`, via `jest-cucumber`) cobre o fluxo feliz completo e os dois caminhos de compensação, exercitando a orquestração real deste serviço — `producao-service`/`pagamento-service` são simulados na borda (evento publicado/consumido), já que um ambiente local com Postgres×2 + MongoDB + RabbitMQ rodando junto ainda não existe. Ver comentário no topo do arquivo de steps.

## Infraestrutura e deploy

Dois ambientes, mesma separação da Fase 3:

- **[`/infra`](infra)** — Terraform (`kind` + Postgres + RabbitMQ), cluster local efêmero. Infraestrutura *própria* deste repositório, validada de graça a cada push no CI (job `deploy`), sem custo de AWS.
- **[`/k8s`](k8s)** — manifestos da aplicação aplicados nesse cluster local.
- **[`/k8s-aws`](k8s-aws)** — deploy real (job `deploy-eks`, atrás da variável de repositório `AWS_DEPLOY_ENABLED=true`). Reaproveita o **mesmo cluster EKS e a mesma instância RDS** dos outros 2 microsserviços (bancos lógicos separados na mesma instância) — ver [`oficina-infra-k8s`](https://github.com/RafaelNikolasPuggi/oficina-infra-k8s) e [`oficina-infra-db`](https://github.com/RafaelNikolasPuggi/oficina-infra-db). Essa decisão (1 cluster/1 instância compartilhados, em vez de 3 de cada) mantém o custo da Fase 4 próximo do que já era gasto na Fase 3, em vez de triplicá-lo.
- O RabbitMQ real (namespace `oficina-shared`) é aplicado de forma idempotente pelos 3 serviços — não importa qual faça o deploy primeiro.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
1. `build-test` — lint, build, testes unitários + cobertura (gate de 80%), BDD, SonarCloud (se `SONAR_TOKEN` estiver configurado)
2. `docker-build-push` — build/push da imagem para o ghcr.io
3. `deploy` — cluster `kind` efêmero, aplica os manifestos, smoke test (health + login), destrói tudo ao final — roda em todo push, sem custo
4. `deploy-eks` — deploy real no EKS compartilhado, só se `AWS_DEPLOY_ENABLED=true`

Branch `main` protegida — PR obrigatório, CI tem que passar.

## Status

Saga completa (RabbitMQ), cobertura de testes acima de 80%, infra como código (local + AWS). Próximas etapas: aplicar o mesmo padrão de infra nos outros 2 serviços, modificar o `oficina-infra-db` para os 2 bancos lógicos, New Relic, vídeo + PDF de entrega da Fase 4.
