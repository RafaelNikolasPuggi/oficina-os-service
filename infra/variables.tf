variable "cluster_name" {
  description = "Nome do cluster kind provisionado localmente."
  type        = string
  default     = "oficina-os-service"
}

variable "namespace" {
  description = "Namespace do Kubernetes onde a aplicação e suas dependências são implantadas. Deve bater com os manifestos em /k8s."
  type        = string
  default     = "oficina-os"
}

variable "postgres_image" {
  type    = string
  default = "postgres:16-alpine"
}

variable "postgres_database" {
  type    = string
  default = "oficina_os"
}

variable "postgres_username" {
  type    = string
  default = "oficina_os"
}

variable "postgres_password" {
  description = "Senha do banco. Em CI/CD, sobrescreva via TF_VAR_postgres_password (nunca commitar um valor real aqui)."
  type        = string
  default     = "oficina_os"
  sensitive   = true
}

variable "postgres_storage_size" {
  type    = string
  default = "1Gi"
}

variable "rabbitmq_image" {
  type    = string
  default = "rabbitmq:3-management-alpine"
}
