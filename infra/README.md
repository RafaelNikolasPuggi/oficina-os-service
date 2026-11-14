# Infraestrutura como Código (Terraform) — oficina-os-service

Provisiona, localmente e sem custo de AWS, a infraestrutura própria deste microsserviço:

1. **Cluster Kubernetes local** (`kind_cluster.this`) — Kind (1 control-plane + 1 worker) em containers Docker.
2. **Banco de dados** (`kubernetes_deployment.postgres` + Service/PVC/Secret) — PostgreSQL só deste serviço.
3. **RabbitMQ** (`kubernetes_deployment.rabbitmq` + Service) — necessário pra aplicação subir (ela conecta na fila `os_queue` no boot).

O deploy da **aplicação em si** fica em [`/k8s`](../k8s), aplicado separadamente com `kubectl apply` — é exatamente essa separação que o CI (`.github/workflows/ci.yml`) executa como passos distintos, a cada push, de graça.

O deploy **real na AWS** (compartilhando o cluster EKS e a instância RDS com os outros 2 microsserviços, pra não triplicar custo) está em [`/k8s-aws`](../k8s-aws) e depende dos repositórios `oficina-infra-k8s`/`oficina-infra-db`.

## Como aplicar

```bash
cd infra
terraform init
terraform apply
export KUBECONFIG=$(terraform output -raw kubeconfig_path)
kubectl apply -f ../k8s
kubectl -n oficina-os rollout status deployment/oficina-os-app
```

## Destruir tudo

```bash
terraform destroy
```
