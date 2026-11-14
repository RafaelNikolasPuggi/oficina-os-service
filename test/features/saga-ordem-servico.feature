# language: pt
Funcionalidade: Saga da Ordem de Serviço (aprovação, execução e pagamento)
  Como orquestrador da Saga, o os-service precisa coordenar corretamente
  o producao-service (reserva de estoque) e o pagamento-service (cobrança),
  incluindo os caminhos de compensação quando um dos dois falha.

  Cenário: Fluxo feliz completo até a entrega
    Dado uma ordem de serviço aguardando aprovação do cliente, com uma peça em estoque suficiente
    Quando o cliente aprova o orçamento
    E o producao-service confirma a reserva das peças
    Então a ordem de serviço é transicionada para execução
    Quando a oficina finaliza a execução da ordem de serviço
    Então o pagamento-service é notificado para cobrar o cliente pela ordem de serviço
    Quando o pagamento-service confirma que o pagamento foi aprovado
    Então a ordem de serviço pode ser entregue ao cliente

  Cenário: Compensação — falta de estoque recusa a aprovação do orçamento
    Dado uma ordem de serviço aguardando aprovação do cliente, com uma peça sem estoque suficiente
    Quando o cliente aprova o orçamento
    E o producao-service recusa a reserva por falta de estoque
    Então a ordem de serviço permanece aguardando aprovação do cliente
    E o cliente é notificado sobre a falta da peça

  Cenário: Compensação — pagamento rejeitado bloqueia a entrega
    Dado uma ordem de serviço finalizada aguardando confirmação de pagamento
    Quando o pagamento-service informa que o pagamento foi rejeitado
    Então a ordem de serviço continua finalizada e não pode ser entregue
    E o cliente é notificado para tentar o pagamento novamente
