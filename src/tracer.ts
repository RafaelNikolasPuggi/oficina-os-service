/**
 * Inicialização do agente APM do New Relic (Fase 3 — observabilidade).
 * Precisa ser o PRIMEIRO import de `main.ts` para que a auto-instrumentação
 * (HTTP, Express/Nest, TypeORM/pg, etc.) consiga interceptar os módulos
 * antes de serem carregados.
 *
 * Fica desligado por padrão (`NEW_RELIC_ENABLED` não definido) — dev local e
 * CI não tentam se conectar a uma conta que não existe. Configuração vem
 * inteiramente de variáveis de ambiente (`NEW_RELIC_NO_CONFIG_FILE=true`),
 * sem arquivo `newrelic.js` no repositório.
 */
if (process.env.NEW_RELIC_ENABLED === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('newrelic');
}
