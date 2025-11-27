# ZhiYeCompass AWS Environment Cleanup Script (PowerShell)
# Region: ca-central-1 (Canada Central)
#
# This script deletes ALL AWS resources created by aws-setup.ps1
# WARNING: This action is IRREVERSIBLE!
#
# Usage:
# .\scripts\aws-cleanup.ps1

#Requires -Version 5.1

$ErrorActionPreference = "Continue"  # Continue on errors to clean up as much as possible

# Configuration (must match aws-setup.ps1)
$REGION = "ca-central-1"
$PROJECT_NAME = "zhiyecompass"
$DYNAMODB_TABLE = "$PROJECT_NAME-main"
$S3_BUCKET = "$PROJECT_NAME-recommendations"
$LAMBDA_FUNCTION = "$PROJECT_NAME-recommendation-engine"
$ROLE_NAME = "$PROJECT_NAME-lambda-role"
$POLICY_NAME = "$PROJECT_NAME-lambda-policy"
$API_NAME = "$PROJECT_NAME-api"
$SECRET_NAME = "$PROJECT_NAME/openai-api-key"

Write-Host "`n🗑️  ZhiYeCompass AWS Cleanup Script" -ForegroundColor Red
Write-Host "Region: $REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  WARNING: This will DELETE the following resources:" -ForegroundColor Yellow
Write-Host "  • DynamoDB Table: $DYNAMODB_TABLE" -ForegroundColor Gray
Write-Host "  • S3 Bucket: $S3_BUCKET (and all contents)" -ForegroundColor Gray
Write-Host "  • Secrets Manager: $SECRET_NAME" -ForegroundColor Gray
Write-Host "  • Lambda Function: $LAMBDA_FUNCTION" -ForegroundColor Gray
Write-Host "  • API Gateway: $API_NAME" -ForegroundColor Gray
Write-Host "  • IAM Role: $ROLE_NAME" -ForegroundColor Gray
Write-Host "  • IAM Policy: $POLICY_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "This action is IRREVERSIBLE!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Type 'DELETE' to confirm deletion"

if ($confirmation -ne "DELETE") {
    Write-Host "`n❌ Cleanup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Starting cleanup...`n" -ForegroundColor Cyan

# Track results
$success = @()
$failed = @()
$skipped = @()

# ============================================
# 1. Delete API Gateway
# ============================================
Write-Host "🌐 Step 1: Deleting API Gateway..." -ForegroundColor Yellow

try {
    $API_ID = aws apigateway get-rest-apis `
        --region $REGION `
        --query "items[?name=='$API_NAME'].id" `
        --output text 2>$null

    if ($API_ID -and $API_ID -ne "None") {
        aws apigateway delete-rest-api `
            --rest-api-id $API_ID `
            --region $REGION 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API Gateway deleted: $API_NAME" -ForegroundColor Green
            $success += "API Gateway: $API_NAME"
        } else {
            Write-Host "❌ Failed to delete API Gateway" -ForegroundColor Red
            $failed += "API Gateway: $API_NAME"
        }
    } else {
        Write-Host "⏭️  API Gateway not found, skipping" -ForegroundColor Gray
        $skipped += "API Gateway: $API_NAME"
    }
} catch {
    Write-Host "❌ Error deleting API Gateway: $_" -ForegroundColor Red
    $failed += "API Gateway: $API_NAME"
}
Write-Host ""

# ============================================
# 2. Delete Lambda Function
# ============================================
Write-Host "⚡ Step 2: Deleting Lambda Function..." -ForegroundColor Yellow

try {
    $lambdaExists = aws lambda get-function `
        --function-name $LAMBDA_FUNCTION `
        --region $REGION 2>$null

    if ($LASTEXITCODE -eq 0) {
        aws lambda delete-function `
            --function-name $LAMBDA_FUNCTION `
            --region $REGION 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lambda function deleted: $LAMBDA_FUNCTION" -ForegroundColor Green
            $success += "Lambda: $LAMBDA_FUNCTION"
        } else {
            Write-Host "❌ Failed to delete Lambda function" -ForegroundColor Red
            $failed += "Lambda: $LAMBDA_FUNCTION"
        }
    } else {
        Write-Host "⏭️  Lambda function not found, skipping" -ForegroundColor Gray
        $skipped += "Lambda: $LAMBDA_FUNCTION"
    }
} catch {
    Write-Host "❌ Error deleting Lambda function: $_" -ForegroundColor Red
    $failed += "Lambda: $LAMBDA_FUNCTION"
}
Write-Host ""

# ============================================
# 3. Delete Secrets Manager Secret
# ============================================
Write-Host "🔐 Step 3: Deleting Secrets Manager secret..." -ForegroundColor Yellow

try {
    $secretExists = aws secretsmanager describe-secret `
        --secret-id $SECRET_NAME `
        --region $REGION 2>$null

    if ($LASTEXITCODE -eq 0) {
        aws secretsmanager delete-secret `
            --secret-id $SECRET_NAME `
            --region $REGION `
            --force-delete-without-recovery 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Secret deleted: $SECRET_NAME" -ForegroundColor Green
            $success += "Secret: $SECRET_NAME"
        } else {
            Write-Host "❌ Failed to delete secret" -ForegroundColor Red
            $failed += "Secret: $SECRET_NAME"
        }
    } else {
        Write-Host "⏭️  Secret not found, skipping" -ForegroundColor Gray
        $skipped += "Secret: $SECRET_NAME"
    }
} catch {
    Write-Host "❌ Error deleting secret: $_" -ForegroundColor Red
    $failed += "Secret: $SECRET_NAME"
}
Write-Host ""

# ============================================
# 4. Delete IAM Policy and Role
# ============================================
Write-Host "👤 Step 4: Deleting IAM Role and Policy..." -ForegroundColor Yellow

try {
    # Detach AWS managed policy
    Write-Host "  Detaching AWSLambdaBasicExecutionRole..." -ForegroundColor Gray
    aws iam detach-role-policy `
        --role-name $ROLE_NAME `
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>$null

    # Get and detach custom policy
    $POLICY_ARN = aws iam list-policies `
        --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" `
        --output text 2>$null

    if ($POLICY_ARN -and $POLICY_ARN -ne "None") {
        Write-Host "  Detaching custom policy..." -ForegroundColor Gray
        aws iam detach-role-policy `
            --role-name $ROLE_NAME `
            --policy-arn $POLICY_ARN 2>$null

        Write-Host "  Deleting custom policy..." -ForegroundColor Gray
        aws iam delete-policy `
            --policy-arn $POLICY_ARN 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ IAM Policy deleted: $POLICY_NAME" -ForegroundColor Green
            $success += "IAM Policy: $POLICY_NAME"
        } else {
            Write-Host "❌ Failed to delete IAM policy" -ForegroundColor Red
            $failed += "IAM Policy: $POLICY_NAME"
        }
    } else {
        Write-Host "⏭️  IAM Policy not found, skipping" -ForegroundColor Gray
        $skipped += "IAM Policy: $POLICY_NAME"
    }

    # Delete role
    Write-Host "  Deleting IAM role..." -ForegroundColor Gray
    $roleExists = aws iam get-role --role-name $ROLE_NAME 2>$null

    if ($LASTEXITCODE -eq 0) {
        aws iam delete-role --role-name $ROLE_NAME 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ IAM Role deleted: $ROLE_NAME" -ForegroundColor Green
            $success += "IAM Role: $ROLE_NAME"
        } else {
            Write-Host "❌ Failed to delete IAM role" -ForegroundColor Red
            $failed += "IAM Role: $ROLE_NAME"
        }
    } else {
        Write-Host "⏭️  IAM Role not found, skipping" -ForegroundColor Gray
        $skipped += "IAM Role: $ROLE_NAME"
    }
} catch {
    Write-Host "❌ Error deleting IAM resources: $_" -ForegroundColor Red
    $failed += "IAM Resources"
}
Write-Host ""

# ============================================
# 5. Delete S3 Bucket (empty first)
# ============================================
Write-Host "🪣 Step 5: Deleting S3 Bucket..." -ForegroundColor Yellow

try {
    $bucketExists = aws s3api head-bucket --bucket $S3_BUCKET 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Emptying bucket (this may take a while)..." -ForegroundColor Gray

        # Delete all objects
        aws s3 rm "s3://$S3_BUCKET" --recursive 2>$null

        # Delete all object versions (for versioned buckets)
        Write-Host "  Deleting object versions..." -ForegroundColor Gray
        $versions = aws s3api list-object-versions `
            --bucket $S3_BUCKET `
            --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' `
            --output json 2>$null | ConvertFrom-Json

        if ($versions.Objects) {
            foreach ($obj in $versions.Objects) {
                aws s3api delete-object `
                    --bucket $S3_BUCKET `
                    --key $obj.Key `
                    --version-id $obj.VersionId 2>$null
            }
        }

        # Delete all delete markers
        $deleteMarkers = aws s3api list-object-versions `
            --bucket $S3_BUCKET `
            --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' `
            --output json 2>$null | ConvertFrom-Json

        if ($deleteMarkers.Objects) {
            foreach ($obj in $deleteMarkers.Objects) {
                aws s3api delete-object `
                    --bucket $S3_BUCKET `
                    --key $obj.Key `
                    --version-id $obj.VersionId 2>$null
            }
        }

        # Delete bucket
        Write-Host "  Deleting bucket..." -ForegroundColor Gray
        aws s3api delete-bucket `
            --bucket $S3_BUCKET `
            --region $REGION 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ S3 Bucket deleted: $S3_BUCKET" -ForegroundColor Green
            $success += "S3 Bucket: $S3_BUCKET"
        } else {
            Write-Host "❌ Failed to delete S3 bucket" -ForegroundColor Red
            $failed += "S3 Bucket: $S3_BUCKET"
        }
    } else {
        Write-Host "⏭️  S3 Bucket not found, skipping" -ForegroundColor Gray
        $skipped += "S3 Bucket: $S3_BUCKET"
    }
} catch {
    Write-Host "❌ Error deleting S3 bucket: $_" -ForegroundColor Red
    $failed += "S3 Bucket: $S3_BUCKET"
}
Write-Host ""

# ============================================
# 6. Delete DynamoDB Table
# ============================================
Write-Host "📊 Step 6: Deleting DynamoDB Table..." -ForegroundColor Yellow

try {
    $tableExists = aws dynamodb describe-table `
        --table-name $DYNAMODB_TABLE `
        --region $REGION 2>$null

    if ($LASTEXITCODE -eq 0) {
        aws dynamodb delete-table `
            --table-name $DYNAMODB_TABLE `
            --region $REGION 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ DynamoDB Table deleted: $DYNAMODB_TABLE" -ForegroundColor Green
            $success += "DynamoDB: $DYNAMODB_TABLE"

            # Wait for deletion
            Write-Host "  Waiting for table deletion..." -ForegroundColor Gray
            aws dynamodb wait table-not-exists `
                --table-name $DYNAMODB_TABLE `
                --region $REGION 2>$null
        } else {
            Write-Host "❌ Failed to delete DynamoDB table" -ForegroundColor Red
            $failed += "DynamoDB: $DYNAMODB_TABLE"
        }
    } else {
        Write-Host "⏭️  DynamoDB Table not found, skipping" -ForegroundColor Gray
        $skipped += "DynamoDB: $DYNAMODB_TABLE"
    }
} catch {
    Write-Host "❌ Error deleting DynamoDB table: $_" -ForegroundColor Red
    $failed += "DynamoDB: $DYNAMODB_TABLE"
}
Write-Host ""

# ============================================
# Cleanup Complete!
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧹 Cleanup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($success.Count -gt 0) {
    Write-Host "✅ Successfully deleted ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "   • $item" -ForegroundColor Gray
    }
    Write-Host ""
}

if ($skipped.Count -gt 0) {
    Write-Host "⏭️  Skipped (not found) ($($skipped.Count)):" -ForegroundColor Yellow
    foreach ($item in $skipped) {
        Write-Host "   • $item" -ForegroundColor Gray
    }
    Write-Host ""
}

if ($failed.Count -gt 0) {
    Write-Host "❌ Failed to delete ($($failed.Count)):" -ForegroundColor Red
    foreach ($item in $failed) {
        Write-Host "   • $item" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "⚠️  Some resources may need manual cleanup in AWS Console" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
