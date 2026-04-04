#!/bin/bash
echo "============================================="
echo "   AETHEROPS END-TO-END SANITY SCRIPT"
echo "============================================="

# Ensure curl exists
if ! command -v curl &> /dev/null; then
    echo "Error: curl could not be found."
    exit 1
fi

echo "1. Checking Edge API Gateway (port 8080)..."
if curl -s http://localhost:8080/health | grep -q "ok"; then
    echo "   [PASS] Edge API is responding correctly."
else
    echo "   [FAIL] Edge API is offline or unreachable."
fi

echo "2. Checking NATS Metrics (port 8222)..."
if curl -s http://localhost:8222/varz | grep -q "server_name"; then
    echo "   [PASS] NATS JetStream is responding correctly."
else
    echo "   [FAIL] NATS is offline or unreachable."
fi

echo "3. Checking React Frontend (port 8088)..."
if curl -I -s http://localhost:8088 | grep -q "200 OK"; then
    echo "   [PASS] Frontend Vite server is alive."
else
    echo "   [FAIL] Frontend server is offline."
fi

echo "============================================="
echo "   E2E Checks Concluded."
echo "============================================="
