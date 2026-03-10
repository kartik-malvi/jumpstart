#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
PDF_FILES=(
  "complete-aptitude-test-500q.pdf"
  "complete-answer-key-500q.pdf"
)
PDF_SOURCE_FILES=()
for pdf in "${PDF_FILES[@]}"; do
  PDF_SOURCE_FILES+=("$ROOT_DIR/$pdf")
done
REMOTE_USER="u760337650"
REMOTE_HOST="89.117.157.249"
REMOTE_PORT="65002"
REMOTE_PATH="/home/u760337650/domains/launchpreview.live/public_html/jumpstart"

echo "Copying PDFs into frontend/public/"
for pdf in "${PDF_FILES[@]}"; do
  cp -f "$ROOT_DIR/$pdf" "$FRONTEND_DIR/public/$pdf"
done

echo "Building frontend"
cd "$FRONTEND_DIR"
npm run build

echo "Uploading dist assets to $REMOTE_HOST"
scp -P "$REMOTE_PORT" -r dist/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

echo "Uploading PDFs to $REMOTE_HOST"
scp -P "$REMOTE_PORT" "${PDF_SOURCE_FILES[@]}" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

echo "Frontend deployed to jumpstart.launchpreview.live"
