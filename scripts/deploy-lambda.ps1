# ZhiYeCompass Lambda Deployment Script
# Builds and deploys the recommendation engine Lambda function
#
# Usage:
# .\scripts\deploy-lambda.ps1
#
# Prerequisites:
# - Node.js 18+ installed
# - AWS CLI configured with appropriate permissions
# - esbuild installed (npm install -g esbuild)

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Configuration
$REGION = "ca-central-1"
$LAMBDA_FUNCTION = "zhiyecompass-recommendation-engine"
$LAMBDA_DIR = Join-Path $PSScriptRoot "..\lambda"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  ZhiYeCompass Lambda Deployment" -ForegroundColor Cyan
Write-Host "  Function: $LAMBDA_FUNCTION" -ForegroundColor Gray
Write-Host "  Region: $REGION" -ForegroundColor Gray
Write-Host "===============================================`n" -ForegroundColor Cyan

# Navigate to lambda directory
Push-Location $LAMBDA_DIR

try {
    # Step 1: Install dependencies
    Write-Host "[1/4] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "      Dependencies installed [OK]" -ForegroundColor Green

    # Step 2: Build the Lambda function
    Write-Host "[2/4] Building Lambda function..." -ForegroundColor Yellow

    # Create dist directory if it doesn't exist
    $distDir = Join-Path $LAMBDA_DIR "dist"
    if (-not (Test-Path $distDir)) {
        New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    }

    # Use esbuild to bundle
    npx esbuild src/index.ts `
        --bundle `
        --platform=node `
        --target=node20 `
        --outfile=dist/index.js `
        --external:@aws-sdk/*

    if ($LASTEXITCODE -ne 0) {
        throw "esbuild failed"
    }
    Write-Host "      Build completed [OK]" -ForegroundColor Green

    # Step 3: Create deployment package
    Write-Host "[3/4] Creating deployment package..." -ForegroundColor Yellow

    $zipFile = Join-Path $LAMBDA_DIR "function.zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }

    # Create zip from dist directory
    Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile -Force

    if (-not (Test-Path $zipFile)) {
        throw "Failed to create zip file"
    }

    $zipSize = (Get-Item $zipFile).Length / 1KB
    Write-Host "      Package created: function.zip (${zipSize:N0} KB) [OK]" -ForegroundColor Green

    # Step 4: Deploy to AWS Lambda
    Write-Host "[4/4] Deploying to AWS Lambda..." -ForegroundColor Yellow

    aws lambda update-function-code `
        --function-name $LAMBDA_FUNCTION `
        --zip-file "fileb://$zipFile" `
        --region $REGION `
        --no-cli-pager

    if ($LASTEXITCODE -ne 0) {
        throw "Lambda deployment failed"
    }
    Write-Host "      Deployment completed [OK]" -ForegroundColor Green

    # Done!
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Function: $LAMBDA_FUNCTION" -ForegroundColor White
    Write-Host "Region: $REGION" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Set OPENAI_API_KEY in Lambda environment variables"
    Write-Host "  2. (Optional) Set ANTHROPIC_API_KEY for Claude support"
    Write-Host "  3. (Optional) Set DEEPSEEK_API_KEY for DeepSeek support"
    Write-Host ""
    Write-Host "To set environment variables:" -ForegroundColor Gray
    Write-Host "  aws lambda update-function-configuration \" -ForegroundColor Gray
    Write-Host "    --function-name $LAMBDA_FUNCTION \" -ForegroundColor Gray
    Write-Host "    --environment Variables='{OPENAI_API_KEY=your-key}' \" -ForegroundColor Gray
    Write-Host "    --region $REGION" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Red
    Write-Host "  Deployment Failed!" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    Pop-Location
}
