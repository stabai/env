alias k="kubectl"
alias mk="minikube"

kin() {
  local ingress_url="http://$(kubectl get ingress | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\s+[0-9]+' | sed -E 's/ +/:/')"
  echo "Accessing $ingress_url ingress..."
  curl $ingress_url
}
