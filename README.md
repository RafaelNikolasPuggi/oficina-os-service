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

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): lint, build, testes unitários + cobertura (gate de 80%), BDD, SonarCloud (se `SONAR_TOKEN` estiver configurado) e build/push da imagem para o ghcr.io. Branch `main` protegida — PR obrigatório, CI tem que passar.

## Status

Saga completa (RabbitMQ) e cobertura de testes acima de 80%. Próximas etapas: Terraform/K8s/CI-CD de deploy, New Relic, vídeo + PDF de entrega da Fase 4.
