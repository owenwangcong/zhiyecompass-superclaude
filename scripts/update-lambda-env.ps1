# ZhiYeCompass Lambda Environment Variables Update Script
# Updates Lambda function environment variables including LLM API keys
#
# Usage:
# .\scripts\update-lambda-env.ps1 -OpenAIKey "your-key"
# .\scripts\update-lambda-env.ps1 -OpenAIKey "your-key" -AnthropicKey "your-key"
# .\scripts\update-lambda-env.ps1 -DeepSeekKey "your-key"

#Requires -Version 5.1

param(
    [Parameter(Mandatory=$false)]
    [string]$OpenAIKey,

    [Parameter(Mandatory=$false)]
    [string]$AnthropicKey,

    [Parameter(Mandatory=$false)]
    [string]$DeepSeekKey
)

$ErrorActionPreference = "Stop"

# Configuration
$REGION = "ca-central-1"
$LAMBDA_FUNCTION = "zhiyecompass-recommendation-engine"
$DYNAMODB_TABLE = "zhiyecompass-main"
$S3_BUCKET = "zhiyecompass-recommendations"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  ZhiYeCompass Lambda Environment Update" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# Build environment variables JSON
$envVars = @{
    REGION = $REGION
    DYNAMODB_TABLE = $DYNAMODB_TABLE
    S3_BUCKET = $S3_BUCKET
}

if ($OpenAIKey) {
    $envVars.OPENAI_API_KEY = $OpenAIKey
    Write-Host "  + OPENAI_API_KEY: [SET]" -ForegroundColor Green
}

if ($AnthropicKey) {
    $envVars.ANTHROPIC_API_KEY = $AnthropicKey
    Write-Host "  + ANTHROPIC_API_KEY: [SET]" -ForegroundColor Green
}

if ($DeepSeekKey) {
    $envVars.DEEPSEEK_API_KEY = $DeepSeekKey
    Write-Host "  + DEEPSEEK_API_KEY: [SET]" -ForegroundColor Green
}

if (-not $OpenAIKey -and -not $AnthropicKey -and -not $DeepSeekKey) {
    Write-Host "Warning: No API keys provided. Only base environment variables will be set." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usage examples:" -ForegroundColor Gray
    Write-Host "  .\update-lambda-env.ps1 -OpenAIKey 'sk-...'" -ForegroundColor Gray
    Write-Host "  .\update-lambda-env.ps1 -AnthropicKey 'sk-ant-...'" -ForegroundColor Gray
    Write-Host "  .\update-lambda-env.ps1 -DeepSeekKey 'sk-...'" -ForegroundColor Gray
    Write-Host ""
}

# Convert to JSON string format for AWS CLI
# AWS CLI expects: --environment '{"Variables":{"KEY":"VALUE"}}'
$envWrapper = @{
    Variables = $envVars
}
# Use -Depth to ensure proper serialization and escape for shell
$envJson = ($envWrapper | ConvertTo-Json -Compress -Depth 10)

Write-Host ""
Write-Host "Updating Lambda environment variables..." -ForegroundColor Yellow
Write-Host "JSON: $envJson" -ForegroundColor Gray

# Use file-based approach to avoid shell escaping issues
$tempFile = [System.IO.Path]::GetTempFileName()
$envJson | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline

try {
    aws lambda update-function-configuration `
        --function-name $LAMBDA_FUNCTION `
        --environment "file://$tempFile" `
        --region $REGION `
        --no-cli-pager
} finally {
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to update environment variables!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Environment Variables Updated!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Function: $LAMBDA_FUNCTION" -ForegroundColor White
Write-Host "Region: $REGION" -ForegroundColor White
Write-Host ""
