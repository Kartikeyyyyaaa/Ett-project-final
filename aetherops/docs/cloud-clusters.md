# EKS and GKE (central)

Build and push images to ECR or Artifact Registry. Create a cluster, install Istio (or your mesh), Argo CD, and Prometheus. Point `infra/argocd/application.yaml` at your Git remote and sync `infra/k8s` into the `aetherops` namespace.
