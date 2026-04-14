#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/bin"
cat > "$TMP_DIR/bin/openssl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${MSYS_NO_PATHCONV:-}" ]]; then
  echo "MSYS_NO_PATHCONV should not be set globally; it breaks output path conversion" >&2
  exit 42
fi

if [[ "${MSYS2_ARG_CONV_EXCL:-}" != *"/CN=localhost"* ]]; then
  echo "expected MSYS2_ARG_CONV_EXCL to include /CN=localhost" >&2
  exit 44
fi

args=("$@")
for ((i=0; i<${#args[@]}; i++)); do
  if [[ "${args[$i]}" == "-subj" ]]; then
    next_index=$((i + 1))
    if [[ "${args[$next_index]:-}" != "/CN=localhost" ]]; then
      echo "expected -subj /CN=localhost, got '${args[$next_index]:-}'" >&2
      exit 43
    fi
  fi
  if [[ "${args[$i]}" == "-keyout" ]]; then
    key_path="${args[$((i + 1))]}"
    mkdir -p "$(dirname "$key_path")"
    : > "$key_path"
  fi
  if [[ "${args[$i]}" == "-out" ]]; then
    cert_path="${args[$((i + 1))]}"
    mkdir -p "$(dirname "$cert_path")"
    : > "$cert_path"
  fi
done
EOF
chmod +x "$TMP_DIR/bin/openssl"

PATH="$TMP_DIR/bin:$PATH" "$ROOT_DIR/generate-certs.sh"

echo "check-generate-certs.sh: PASS"
