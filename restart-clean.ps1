# Clean restart script for Next.js
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow

# Kill all Node processes
Write-Host "Killing Node processes..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Delete .next folder
Write-Host "Deleting .next cache..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "⚠️  .next folder not found" -ForegroundColor Yellow
}

# Start fresh dev server
Write-Host "🚀 Starting fresh dev server on port 9000..." -ForegroundColor Green
$env:PORT = "9000"
npm run dev
