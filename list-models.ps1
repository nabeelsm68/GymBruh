$envPath = Resolve-Path ".env.local"
$content = Get-Content $envPath
$apiKey = $null
foreach ($line in $content) {
    if ($line -match "GEMINI_API_KEY=(.*)") {
        $apiKey = $matches[1].Trim()
        break
    }
}

if (-not $apiKey) {
    Write-Host "No API Key found"
    exit
}

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
try {
    $models = Invoke-RestMethod -Uri $url -Method Get
    $models.models | ForEach-Object { Write-Host $_.name }
} catch {
    Write-Host "Error listing models: $_"
}
