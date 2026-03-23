#!/usr/bin/env bash
# Moment 1: fail a pod via API; background loop recovers it (~2s) like Kubernetes reconciliation.
set -euo pipefail
URL="${AETHEROPS_API:-http://127.0.0.1:8081}"
echo "Failing pod aetherops-api at $URL ..."
curl -sS -X POST "$URL/api/v1/pods/aetherops-api/fail"
echo
echo "Watch the 3D dashboard — red alert, then green after reconcile."
sleep 3
curl -sS "$URL/api/v1/pods"
echo
