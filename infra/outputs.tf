output "cluster_name" {
  value = kind_cluster.this.name
}

output "kubeconfig_path" {
  description = "Caminho do kubeconfig do cluster kind, gerado automaticamente pelo provider."
  value       = kind_cluster.this.kubeconfig_path
}

output "namespace" {
  value = kubernetes_namespace.this.metadata[0].name
}

output "postgres_service" {
  description = "Nome do Service do Postgres dentro do cluster (usado como DB_HOST pela aplicação)."
  value       = kubernetes_service.postgres.metadata[0].name
}

output "rabbitmq_service" {
  description = "Nome do Service do RabbitMQ dentro do cluster."
  value       = kubernetes_service.rabbitmq.metadata[0].name
}
