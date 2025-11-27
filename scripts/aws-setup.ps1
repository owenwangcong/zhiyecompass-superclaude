# ZhiYeCompass AWS Environment Setup Script (PowerShell)
# Region: ca-central-1 (Canada Central)
# LLM: OpenAI ChatGPT
#
# Prerequisites:
# - AWS CLI installed and configured
# - AWS account with appropriate permissions
#
# Usage:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# .\scripts\aws-setup.ps1

#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Configuration
$REGION = "ca-central-1"
$PROJECT_NAME = "zhiyecompass"
$DYNAMODB_TABLE = "$PROJECT_NAME-main"
$S3_BUCKET = "$PROJECT_NAME-recommendations"
$LAMBDA_FUNCTION = "$PROJECT_NAME-recommendation-engine"

# Create temp directory for JSON files (AWS CLI needs file:// for complex JSON)
$tempDir = Join-Path $env:TEMP "zhiyecompass-setup"
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  ZhiYeCompass AWS Setup" -ForegroundColor Cyan
Write-Host "  Region: $REGION" -ForegroundColor Gray
Write-Host "===============================================`n" -ForegroundColor Cyan

# ============================================
# 1. DynamoDB Table Setup (Single Table Design)
# ============================================
Write-Host "[1/6] Creating DynamoDB Table..." -ForegroundColor Yellow

aws dynamodb create-table `
  --table-name $DYNAMODB_TABLE `
  --region $REGION `
  --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S `
  --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE `
  --billing-mode PAY_PER_REQUEST `
  --tags Key=Project,Value=ZhiYeCompass Key=Environment,Value=Production `
  --no-cli-pager

Write-Host "      Waiting for table to be active..." -ForegroundColor Gray
aws dynamodb wait table-exists --table-name $DYNAMODB_TABLE --region $REGION

# Enable Point-in-Time Recovery
aws dynamodb update-continuous-backups `
  --table-name $DYNAMODB_TABLE `
  --region $REGION `
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true `
  --no-cli-pager

# Enable TTL
aws dynamodb update-time-to-live `
  --table-name $DYNAMODB_TABLE `
  --region $REGION `
  --time-to-live-specification Enabled=true,AttributeName=ttl `
  --no-cli-pager

Write-Host "      DynamoDB Table: $DYNAMODB_TABLE [OK]" -ForegroundColor Green

# ============================================
# 2. S3 Bucket Setup
# ============================================
Write-Host "[2/6] Creating S3 Bucket..." -ForegroundColor Yellow

aws s3api create-bucket `
  --bucket $S3_BUCKET `
  --region $REGION `
  --create-bucket-configuration LocationConstraint=$REGION `
  --no-cli-pager

# Enable versioning
aws s3api put-bucket-versioning `
  --bucket $S3_BUCKET `
  --versioning-configuration Status=Enabled

# Enable encryption (write JSON to file)
$encryptionFile = Join-Path $tempDir "encryption.json"
@'
{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }
  ]
}
'@ | Out-File -FilePath $encryptionFile -Encoding ASCII -NoNewline

aws s3api put-bucket-encryption `
  --bucket $S3_BUCKET `
  --server-side-encryption-configuration "file://$encryptionFile"

# Block public access
aws s3api put-public-access-block `
  --bucket $S3_BUCKET `
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Configure CORS (write JSON to file)
$corsFile = Join-Path $tempDir "cors.json"
@'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
'@ | Out-File -FilePath $corsFile -Encoding ASCII -NoNewline

aws s3api put-bucket-cors `
  --bucket $S3_BUCKET `
  --cors-configuration "file://$corsFile"

# Create folder structure
aws s3api put-object --bucket $S3_BUCKET --key recommendations/ --region $REGION --no-cli-pager
aws s3api put-object --bucket $S3_BUCKET --key shared/ --region $REGION --no-cli-pager

# Lifecycle policy (write JSON to file)
$lifecycleFile = Join-Path $tempDir "lifecycle.json"
@'
{
  "Rules": [
    {
      "ID": "ArchiveOldRecommendations",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "recommendations/"
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        }
      ]
    }
  ]
}
'@ | Out-File -FilePath $lifecycleFile -Encoding ASCII -NoNewline

aws s3api put-bucket-lifecycle-configuration `
  --bucket $S3_BUCKET `
  --lifecycle-configuration "file://$lifecycleFile"

Write-Host "      S3 Bucket: $S3_BUCKET [OK]" -ForegroundColor Green

# ============================================
# 3. IAM Role for Lambda
# ============================================
Write-Host "[3/6] Creating IAM Role..." -ForegroundColor Yellow

$ROLE_NAME = "$PROJECT_NAME-lambda-role"
$POLICY_NAME = "$PROJECT_NAME-lambda-policy"

# Trust policy (write JSON to file)
$trustPolicyFile = Join-Path $tempDir "trust-policy.json"
@'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
'@ | Out-File -FilePath $trustPolicyFile -Encoding ASCII -NoNewline

aws iam create-role `
  --role-name $ROLE_NAME `
  --assume-role-policy-document "file://$trustPolicyFile" `
  --description "Execution role for ZhiYeCompass Lambda functions" `
  --no-cli-pager

# Attach basic execution policy
aws iam attach-role-policy `
  --role-name $ROLE_NAME `
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Get AWS account ID
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

# Custom policy (write JSON to file)
$customPolicyFile = Join-Path $tempDir "custom-policy.json"
@"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:$REGION`:$ACCOUNT_ID`:table/$DYNAMODB_TABLE"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
"@ | Out-File -FilePath $customPolicyFile -Encoding ASCII -NoNewline

$POLICY_ARN = aws iam create-policy `
  --policy-name $POLICY_NAME `
  --policy-document "file://$customPolicyFile" `
  --query 'Policy.Arn' `
  --output text

aws iam attach-role-policy `
  --role-name $ROLE_NAME `
  --policy-arn $POLICY_ARN

Write-Host "      IAM Role: $ROLE_NAME [OK]" -ForegroundColor Green

# ============================================
# 4. Lambda Function
# ============================================
Write-Host "[4/6] Creating Lambda Function..." -ForegroundColor Yellow

# Lambda code
$lambdaFile = Join-Path $tempDir "index.js"
@'
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'ZhiYeCompass Lambda placeholder - ready for implementation',
      timestamp: new Date().toISOString()
    })
  };
};
'@ | Out-File -FilePath $lambdaFile -Encoding ASCII -NoNewline

# Create zip
$zipFile = Join-Path $tempDir "lambda-function.zip"
Compress-Archive -Path $lambdaFile -DestinationPath $zipFile -Force

# Wait for IAM role propagation
Write-Host "      Waiting for IAM role propagation (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

aws lambda create-function `
  --function-name $LAMBDA_FUNCTION `
  --region $REGION `
  --runtime nodejs20.x `
  --role "arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}" `
  --handler index.handler `
  --zip-file "fileb://$zipFile" `
  --timeout 30 `
  --memory-size 512 `
  --environment "Variables={DYNAMODB_TABLE=$DYNAMODB_TABLE,S3_BUCKET=$S3_BUCKET,REGION=$REGION}" `
  --tags Project=ZhiYeCompass,Environment=Production `
  --no-cli-pager

Write-Host "      Lambda Function: $LAMBDA_FUNCTION [OK]" -ForegroundColor Green

# ============================================
# 5. API Gateway
# ============================================
Write-Host "[5/6] Creating API Gateway..." -ForegroundColor Yellow

$API_NAME = "$PROJECT_NAME-api"

$API_ID = aws apigateway create-rest-api `
  --name $API_NAME `
  --description "ZhiYeCompass Recommendation API" `
  --region $REGION `
  --endpoint-configuration types=REGIONAL `
  --query 'id' `
  --output text

$ROOT_ID = aws apigateway get-resources `
  --rest-api-id $API_ID `
  --region $REGION `
  --query 'items[0].id' `
  --output text

$RESOURCE_ID = aws apigateway create-resource `
  --rest-api-id $API_ID `
  --region $REGION `
  --parent-id $ROOT_ID `
  --path-part "recommend" `
  --query 'id' `
  --output text

aws apigateway put-method `
  --rest-api-id $API_ID `
  --region $REGION `
  --resource-id $RESOURCE_ID `
  --http-method POST `
  --authorization-type NONE `
  --no-cli-pager

$LAMBDA_ARN = "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTION}"

aws apigateway put-integration `
  --rest-api-id $API_ID `
  --region $REGION `
  --resource-id $RESOURCE_ID `
  --http-method POST `
  --type AWS_PROXY `
  --integration-http-method POST `
  --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" `
  --no-cli-pager

aws lambda add-permission `
  --function-name $LAMBDA_FUNCTION `
  --region $REGION `
  --statement-id apigateway-invoke `
  --action lambda:InvokeFunction `
  --principal apigateway.amazonaws.com `
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*"

aws apigateway create-deployment `
  --rest-api-id $API_ID `
  --region $REGION `
  --stage-name prod `
  --description "Initial deployment" `
  --no-cli-pager

$API_ENDPOINT = "https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

Write-Host "      API Gateway: $API_NAME [OK]" -ForegroundColor Green

# ============================================
# 6. Initialize System Config
# ============================================
Write-Host "[6/6] Initializing System Configuration..." -ForegroundColor Yellow

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$configFile = Join-Path $tempDir "config-item.json"
@"
{
  "PK": {"S": "CONFIG#SYSTEM"},
  "SK": {"S": "SETTINGS"},
  "hourly_limit": {"N": "10"},
  "llm_model": {"S": "gpt-4o"},
  "llm_provider": {"S": "openai"},
  "updated_at": {"S": "$timestamp"}
}
"@ | Out-File -FilePath $configFile -Encoding ASCII -NoNewline

aws dynamodb put-item `
  --table-name $DYNAMODB_TABLE `
  --region $REGION `
  --item "file://$configFile" `
  --no-cli-pager

Write-Host "      System Config: hourly_limit=10, model=gpt-4o [OK]" -ForegroundColor Green

# ============================================
# Setup Complete!
# ============================================
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resources Created:" -ForegroundColor White
Write-Host "  - DynamoDB Table: $DYNAMODB_TABLE"
Write-Host "  - S3 Bucket: $S3_BUCKET"
Write-Host "  - IAM Role: $ROLE_NAME"
Write-Host "  - IAM Policy: $POLICY_NAME"
Write-Host "  - Lambda Function: $LAMBDA_FUNCTION"
Write-Host "  - API Gateway: $API_NAME"
Write-Host ""
Write-Host "API Endpoint:" -ForegroundColor White
Write-Host "  $API_ENDPOINT/recommend" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Add to .env.local:"
Write-Host "     DYNAMODB_TABLE=$DYNAMODB_TABLE"
Write-Host "     S3_BUCKET=$S3_BUCKET"
Write-Host "     AWS_REGION=$REGION"
Write-Host "     API_ENDPOINT=$API_ENDPOINT"
Write-Host ""
Write-Host "  2. Set OPENAI_API_KEY in Lambda environment"
Write-Host "  3. Implement Lambda function code"
Write-Host "  4. Test API endpoint"
Write-Host ""
Write-Host "Monthly Cost Estimate: ~`$35-90" -ForegroundColor Gray
Write-Host "===============================================" -ForegroundColor Cyan

# Clean up temp files
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
