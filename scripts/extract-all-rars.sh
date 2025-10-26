#!/bin/bash

KPI_DATA_PATH="${KPI_DATA_PATH:-/backend/kpi_data}"
PROCESSED_PATH="$KPI_DATA_PATH/processed"

echo "🔄 Extracting all RAR files from $PROCESSED_PATH"
echo ""

total=0
success=0
errors=0

# Find all RAR files
for rar_file in $(find "$PROCESSED_PATH" -name "*.rar" | sort); do
  total=$((total + 1))

  # Extract date and month from path
  # Example: /backend/kpi_data/processed/202507/20250704.rar
  filename=$(basename "$rar_file")
  month_dir=$(basename $(dirname "$rar_file"))
  datestr="${filename%.rar}"

  # Create extract directory
  extract_dir="$KPI_DATA_PATH/$month_dir/$datestr"

  # Skip if already extracted
  if [ -d "$extract_dir" ] && [ "$(ls -A "$extract_dir" | grep -c .xlsx)" -gt 0 ]; then
    echo "⏭️  $datestr - already extracted"
    success=$((success + 1))
    continue
  fi

  echo "📥 Extracting $datestr..."

  # Create directory
  mkdir -p "$extract_dir"

  # Extract using 7z
  if 7z x "$rar_file" -o"$extract_dir" -y > /dev/null 2>&1; then
    success=$((success + 1))
    echo "✅ $datestr - extracted successfully"
  else
    errors=$((errors + 1))
    echo "❌ $datestr - extraction failed"
  fi
done

echo ""
echo "============================================================"
echo "📊 EXTRACTION SUMMARY"
echo "============================================================"
echo "📁 Total RAR files: $total"
echo "✅ Successfully extracted: $success"
echo "❌ Errors: $errors"
echo "============================================================"
