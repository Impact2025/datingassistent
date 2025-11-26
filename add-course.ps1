# add-course.ps1
# PowerShell wrapper voor het toevoegen van pro cursussen met Gemini 1.5 Pro

param(
    [string]$CourseName = "Dating Mastery Course",
    [string]$Description = "Een diepgaande cursus over dating en relaties",
    [string]$Audience = "Volwassenen met persoonlijke omstandigheden"
)

Write-Host "🎓 DatingAssistant Pro Cursus Generator" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check of Node.js geïnstalleerd is
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js niet gevonden. Installeer Node.js eerst." -ForegroundColor Red
    exit 1
}

# Check of GEMINI_API_KEY environment variabele is ingesteld
if (-not $env:GEMINI_API_KEY) {
    Write-Host "⚠️  GEMINI_API_KEY niet ingesteld als environment variabele" -ForegroundColor Yellow
    Write-Host "Je wordt nu om je API key gevraagd..." -ForegroundColor Yellow
    Write-Host ""
}

# Run het Node.js script
Write-Host "📝 Parameters:" -ForegroundColor Green
Write-Host "   Cursusnaam: $CourseName"
Write-Host "   Beschrijving: $Description"
Write-Host "   Doelgroep: $Audience"
Write-Host ""

node add-course.js $CourseName $Description $Audience

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✨ Cursus succesvol gegenereerd!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Er is een fout opgetreden. Controleer de bovenstaande berichten." -ForegroundColor Red
    exit 1
}
