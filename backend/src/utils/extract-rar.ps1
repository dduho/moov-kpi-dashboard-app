param(
    [string]$rarPath,
    [string]$extractPath
)

Write-Host "Extracting RAR file: $rarPath"
Write-Host "To directory: $extractPath"

try {
    # Create extraction directory if it doesn't exist
    if (!(Test-Path $extractPath)) {
        New-Item -ItemType Directory -Path $extractPath | Out-Null
    }

    # Use Shell.Application COM object for extraction
    $shell = New-Object -ComObject Shell.Application
    $rar = $shell.NameSpace($rarPath)
    $destination = $shell.NameSpace($extractPath)

    if ($rar) {
        $items = $rar.Items()
        Write-Host "Found $($items.Count) items in RAR file"

        if ($items.Count -gt 0) {
            # Copy with options: 16 = no progress dialog, 4 = don't show dialog
            $destination.CopyHere($items, 20)
            Start-Sleep -Seconds 2  # Wait for extraction to complete

            Write-Host "Extraction completed successfully"
            exit 0
        } else {
            Write-Host "No items found in RAR file"
            exit 1
        }
    } else {
        Write-Host "Could not open RAR file: $rarPath"
        exit 1
    }
} catch {
    Write-Host "Error during extraction: $($_.Exception.Message)"
    exit 1
}