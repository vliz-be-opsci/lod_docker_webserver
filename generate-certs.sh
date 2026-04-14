#!/bin/bash
# generate-certs.sh – create a self-signed TLS certificate for localhost.
# Run once before building the Docker image.

set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)/certs"
mkdir -p "$CERT_DIR"

MSYS2_ARG_CONV_EXCL='/CN=localhost' openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out    "$CERT_DIR/server.crt" \
  -subj   "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificates written to $CERT_DIR"
