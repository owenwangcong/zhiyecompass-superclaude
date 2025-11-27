# ZhiYeCompass AWS Cleanup Script - Force Mode (No confirmation)
# WARNING: This deletes all resources immediately!

#Requires -Version 5.1
$ErrorActionPreference = "Continue"

$REGION = "ca-central-1"
$PROJECT_NAME = "zhiyecompass"
$DYNAMODB_TABLE = "$PROJECT_NAME-main"
$S3_BUCKET = "$PROJECT_NAME-recommendations"
$LAMBDA_FUNCTION = "$PROJECT_NAME-recommendation-engine"
$ROLE_NAME = "$PROJECT_NAME-lambda-role"
$POLICY_NAME = "$PROJECT_NAME-lambda-policy"
$API_NAME = "$PROJECT_NAME-api"
$SECRET_NAME = "$PROJECT_NAME/openai-api-key"

Write-Host "Starting forced cleanup..." -ForegroundColor Yellow

# 1. Delete API Gateway
Write-Host "Deleting API Gateway..." -ForegroundColor Gray
$API_ID = aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text 2>$null
if ($API_ID -and $API_ID -ne "None" -and $API_ID -ne "") {
    aws apigateway delete-rest-api --rest-api-id $API_ID --region $REGION 2>$null
    Write-Host "  Deleted API Gateway: $API_ID" -ForegroundColor Green
}

# 2. Delete Lambda
Write-Host "Deleting Lambda..." -ForegroundColor Gray
aws lambda delete-function --function-name $LAMBDA_FUNCTION --region $REGION 2>$null

# 3. Delete Secret
Write-Host "Deleting Secret..." -ForegroundColor Gray
aws secretsmanager delete-secret --secret-id $SECRET_NAME --region $REGION --force-delete-without-recovery 2>$null

# 4. Detach and delete IAM
Write-Host "Cleaning up IAM..." -ForegroundColor Gray
aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>$null

$POLICY_ARN = aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text 2>$null
if ($POLICY_ARN -and $POLICY_ARN -ne "None" -and $POLICY_ARN -ne "") {
    aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn $POLICY_ARN 2>$null
    aws iam delete-policy --policy-arn $POLICY_ARN 2>$null
}
aws iam delete-role --role-name $ROLE_NAME 2>$null

# 5. Delete S3 bucket
Write-Host "Deleting S3 bucket..." -ForegroundColor Gray
aws s3 rm "s3://$S3_BUCKET" --recursive 2>$null

# Delete versions
$versions = aws s3api list-object-versions --bucket $S3_BUCKET --output json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($versions.Versions) {
    foreach ($v in $versions.Versions) {
        aws s3api delete-object --bucket $S3_BUCKET --key $v.Key --version-id $v.VersionId 2>$null
    }
}
if ($versions.DeleteMarkers) {
    foreach ($dm in $versions.DeleteMarkers) {
        aws s3api delete-object --bucket $S3_BUCKET --key $dm.Key --version-id $dm.VersionId 2>$null
    }
}
aws s3api delete-bucket --bucket $S3_BUCKET --region $REGION 2>$null

# 6. Delete DynamoDB
Write-Host "Deleting DynamoDB table..." -ForegroundColor Gray
aws dynamodb delete-table --table-name $DYNAMODB_TABLE --region $REGION 2>$null

Write-Host "`nCleanup complete!" -ForegroundColor Green
