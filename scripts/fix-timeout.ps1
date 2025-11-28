# Fix Lambda Timeout Issue
# This script:
# 1. Increases Lambda timeout to 120 seconds
# 2. Creates a Lambda Function URL (no API Gateway timeout limit)
#
# Usage:
# .\scripts\fix-timeout.ps1

$ErrorActionPreference = "Stop"

$REGION = "ca-central-1"
$LAMBDA_FUNCTION = "zhiyecompass-recommendation-engine"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Fix Lambda Timeout Issue" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Update Lambda timeout to 120 seconds
Write-Host "[1/3] Updating Lambda timeout to 120 seconds..." -ForegroundColor Yellow

aws lambda update-function-configuration `
    --function-name $LAMBDA_FUNCTION `
    --timeout 120 `
    --region $REGION `
    --no-cli-pager

if ($LASTEXITCODE -ne 0) {
    Write-Host "      Failed to update timeout" -ForegroundColor Red
    exit 1
}
Write-Host "      Lambda timeout updated to 120s [OK]" -ForegroundColor Green

# Wait for function to be updated
Write-Host "[2/3] Waiting for Lambda to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 2: Check if Function URL already exists
Write-Host "[3/3] Creating Lambda Function URL..." -ForegroundColor Yellow

$existingUrl = $null
try {
    $existingUrl = aws lambda get-function-url-config `
        --function-name $LAMBDA_FUNCTION `
        --region $REGION `
        --query 'FunctionUrl' `
        --output text 2>$null
} catch {
    # Function URL doesn't exist, which is fine
}

if ($existingUrl -and $existingUrl -ne "None" -and $existingUrl -ne "") {
    Write-Host "      Function URL already exists: $existingUrl" -ForegroundColor Green
    $FUNCTION_URL = $existingUrl
} else {
    # Create Function URL without CORS first
    $result = aws lambda create-function-url-config `
        --function-name $LAMBDA_FUNCTION `
        --auth-type NONE `
        --region $REGION `
        --output json | ConvertFrom-Json

    if ($LASTEXITCODE -ne 0) {
        Write-Host "      Failed to create Function URL" -ForegroundColor Red
        exit 1
    }

    $FUNCTION_URL = $result.FunctionUrl
    Write-Host "      Function URL created [OK]" -ForegroundColor Green

    # Update CORS separately using shorthand syntax
    Write-Host "      Configuring CORS..." -ForegroundColor Yellow
    aws lambda update-function-url-config `
        --function-name $LAMBDA_FUNCTION `
        --cors "AllowOrigins=*,AllowMethods=*,AllowHeaders=Content-Type" `
        --region $REGION `
        --no-cli-pager 2>$null

    Write-Host "      CORS configured [OK]" -ForegroundColor Green

    # Add permissions for public access (both are required!)
    Write-Host "      Adding public access permissions..." -ForegroundColor Yellow

    # Permission 1: InvokeFunctionUrl
    aws lambda add-permission `
        --function-name $LAMBDA_FUNCTION `
        --statement-id FunctionURLInvokeUrl `
        --action lambda:InvokeFunctionUrl `
        --principal "*" `
        --function-url-auth-type NONE `
        --region $REGION `
        --no-cli-pager 2>$null

    # Permission 2: InvokeFunction (required for Function URL to work!)
    aws lambda add-permission `
        --function-name $LAMBDA_FUNCTION `
        --statement-id FunctionURLInvokeFunction `
        --action lambda:InvokeFunction `
        --principal "*" `
        --region $REGION `
        --no-cli-pager 2>$null

    Write-Host "      Public access permissions added [OK]" -ForegroundColor Green
}

# Remove trailing slash from URL for consistency
$FUNCTION_URL = $FUNCTION_URL.TrimEnd('/')

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Fix Completed!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "New Lambda Function URL:" -ForegroundColor White
Write-Host "  $FUNCTION_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Update your .env.local file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  API_ENDPOINT=$FUNCTION_URL" -ForegroundColor White
Write-Host ""
Write-Host "Note: Lambda Function URL has NO timeout limit" -ForegroundColor Gray
Write-Host "(only limited by Lambda's own timeout: 120s)" -ForegroundColor Gray
Write-Host ""
