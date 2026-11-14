# Provisiona, localmente (sem custo de AWS), o que este serviço precisa pra
# rodar sozinho e validar o build no CI a cada push:
#   1) o cluster Kubernetes local (kind), rodando dentro do Docker;
#   2) o banco de dados (PostgreSQL) e o broker (RabbitMQ), implantados
#      dentro desse cluster.
#
# O deploy da aplicação em si (Deployment/Service/ConfigMap/Secret/HPA) fica
# em /k8s, aplicado separadamente via `kubectl apply` — ver README.md.
#
# Esta é a infra "própria" deste repositório (requisito da Fase 4: cada
# microsserviço com seu próprio repo+infra+banco). O deploy real compartilha
# o cluster EKS e a instância RDS entre os 3 serviços — ver /k8s-aws e o
# repositório oficina-infra-k8s/oficina-infra-db.

provider "kind" {}

resource "kind_cluster" "this" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
    }
    node {
      role = "worker"
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.this.endpoint
  client_certificate     = kind_cluster.this.client_certificate
  client_key             = kind_cluster.this.client_key
  cluster_ca_certificate = kind_cluster.this.cluster_ca_certificate
}

resource "kubernetes_namespace" "this" {
  metadata {
    name = var.namespace
  }

  depends_on = [kind_cluster.this]
}

resource "kubernetes_secret" "postgres" {
  metadata {
    name      = "oficina-os-postgres-secret"
    namespace = kubernetes_namespace.this.metadata[0].name
  }

  data = {
    POSTGRES_USER     = var.postgres_username
    POSTGRES_PASSWORD = var.postgres_password
    POSTGRES_DB       = var.postgres_database
  }
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "oficina-os-postgres-data"
    namespace = kubernetes_namespace.this.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = var.postgres_storage_size
      }
    }
  }

  wait_until_bound = false
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "oficina-os-postgres"
    namespace = kubernetes_namespace.this.metadata[0].name
    labels    = { app = "oficina-os-postgres" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "oficina-os-postgres" }
    }

    template {
      metadata {
        labels = { app = "oficina-os-postgres" }
      }

      spec {
        container {
          name  = "postgres"
          image = var.postgres_image

          env_from {
            secret_ref {
              name = kubernetes_secret.postgres.metadata[0].name
            }
          }

          port {
            container_port = 5432
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
            sub_path   = "postgres"
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.postgres_username]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }

        volume {
          name = "data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    # O nome do Service precisa bater com DB_HOST no ConfigMap em /k8s.
    name      = "oficina-os-postgres"
    namespace = kubernetes_namespace.this.metadata[0].name
  }

  spec {
    selector = { app = "oficina-os-postgres" }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_deployment" "rabbitmq" {
  metadata {
    name      = "oficina-rabbitmq"
    namespace = kubernetes_namespace.this.metadata[0].name
    labels    = { app = "oficina-rabbitmq" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "oficina-rabbitmq" }
    }

    template {
      metadata {
        labels = { app = "oficina-rabbitmq" }
      }

      spec {
        container {
          name  = "rabbitmq"
          image = var.rabbitmq_image

          port {
            container_port = 5672
          }
          port {
            container_port = 15672
          }

          readiness_probe {
            exec {
              command = ["rabbitmq-diagnostics", "check_port_connectivity"]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "rabbitmq" {
  metadata {
    # O nome do Service precisa bater com RABBITMQ_URL no ConfigMap em /k8s.
    name      = "oficina-rabbitmq"
    namespace = kubernetes_namespace.this.metadata[0].name
  }

  spec {
    selector = { app = "oficina-rabbitmq" }
    port {
      name        = "amqp"
      port        = 5672
      target_port = 5672
    }
    port {
      name        = "management"
      port        = 15672
      target_port = 15672
    }
  }
}
