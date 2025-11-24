#!/bin/bash
# ZhiYeCompass AWS Environment Setup Script
# Region: ca-central-1 (Canada Central)
#
# Prerequisites:
# - AWS CLI installed and configured
# - AWS account with appropriate permissions
# - jq installed for JSON processing

set -e  # Exit on error

# Configuration
REGION="ca-central-1"
PROJECT_NAME="zhiyecompass"
DYNAMODB_TABLE="${PROJECT_NAME}-main"
S3_BUCKET="${PROJECT_NAME}-recommendations"
LAMBDA_FUNCTION="${PROJECT_NAME}-recommendation-engine"

echo "🚀 Starting AWS Setup for ZhiYeCompass"
echo "Region: $REGION"
echo ""

# ============================================
# 1. DynamoDB Table Setup (Single Table Design)
# ============================================
echo "📊 Step 1: Creating DynamoDB Table..."

aws dynamodb create-table \
  --table-name "$DYNAMODB_TABLE" \
  --region "$REGION" \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=ZhiYeCompass Key=Environment,Value=Production \
  --stream-specification StreamEnabled=false

echo "✅ DynamoDB Table created: $DYNAMODB_TABLE"
echo ""

# Wait for table to be active
echo "⏳ Waiting for DynamoDB table to be active..."
aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$REGION"
echo "✅ DynamoDB Table is active"
echo ""

# Enable Point-in-Time Recovery (recommended for production)
echo "🔐 Enabling Point-in-Time Recovery..."
aws dynamodb update-continuous-backups \
  --table-name "$DYNAMODB_TABLE" \
  --region "$REGION" \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

echo "✅ Point-in-Time Recovery enabled"
echo ""

# Enable TTL for quota records
echo "⏰ Enabling TTL for automatic quota reset..."
aws dynamodb update-time-to-live \
  --table-name "$DYNAMODB_TABLE" \
  --region "$REGION" \
  --time-to-live-specification "Enabled=true,AttributeName=ttl"

echo "✅ TTL enabled on 'ttl' attribute"
echo ""

# ============================================
# 2. S3 Bucket Setup (Recommendation Storage)
# ============================================
echo "🪣 Step 2: Creating S3 Bucket..."

# Create bucket
aws s3api create-bucket \
  --bucket "$S3_BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"

echo "✅ S3 Bucket created: $S3_BUCKET"
echo ""

# Enable versioning
echo "📦 Enabling S3 versioning..."
aws s3api put-bucket-versioning \
  --bucket "$S3_BUCKET" \
  --versioning-configuration Status=Enabled

echo "✅ Versioning enabled"
echo ""

# Enable server-side encryption
echo "🔐 Enabling S3 encryption..."
aws s3api put-bucket-encryption \
  --bucket "$S3_BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'

echo "✅ Encryption enabled"
echo ""

# Block public access (security best practice)
echo "🔒 Blocking public access..."
aws s3api put-public-access-block \
  --bucket "$S3_BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ Public access blocked"
echo ""

# Configure CORS for frontend access
echo "🌐 Configuring CORS..."
aws s3api put-bucket-cors \
  --bucket "$S3_BUCKET" \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }]
  }'

echo "✅ CORS configured"
echo ""

# Create folder structure
echo "📁 Creating S3 folder structure..."
aws s3api put-object --bucket "$S3_BUCKET" --key recommendations/ --region "$REGION"
aws s3api put-object --bucket "$S3_BUCKET" --key shared/ --region "$REGION"

echo "✅ Folder structure created"
echo ""

# Add lifecycle policy for cost optimization (optional)
echo "♻️ Setting up lifecycle policy..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$S3_BUCKET" \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "ArchiveOldRecommendations",
      "Status": "Enabled",
      "Filter": {"Prefix": "recommendations/"},
      "Transitions": [{
        "Days": 90,
        "StorageClass": "STANDARD_IA"
      }]
    }]
  }'

echo "✅ Lifecycle policy configured (90-day transition to IA)"
echo ""

# ============================================
# 3. IAM Role for Lambda
# ============================================
echo "👤 Step 3: Creating IAM Role for Lambda..."

# Create trust policy document
cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "lambda.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create IAM role
ROLE_NAME="${PROJECT_NAME}-lambda-role"
aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
  --description "Execution role for ZhiYeCompass Lambda functions"

echo "✅ IAM Role created: $ROLE_NAME"
echo ""

# Attach basic Lambda execution policy
echo "📜 Attaching execution policies..."
aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Create custom policy for DynamoDB and S3 access
cat > /tmp/lambda-custom-policy.json <<EOF
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
      "Resource": "arn:aws:dynamodb:${REGION}:*:table/${DYNAMODB_TABLE}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:${REGION}::foundation-model/anthropic.claude-*"
    }
  ]
}
EOF

POLICY_NAME="${PROJECT_NAME}-lambda-policy"
POLICY_ARN=$(aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document file:///tmp/lambda-custom-policy.json \
  --query 'Policy.Arn' \
  --output text)

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "$POLICY_ARN"

echo "✅ Custom policy attached: $POLICY_NAME"
echo ""

# ============================================
# 4. Lambda Function Placeholder
# ============================================
echo "⚡ Step 4: Creating Lambda Function placeholder..."

# Create a simple placeholder Lambda function
cat > /tmp/lambda-index.js <<EOF
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
EOF

# Zip the Lambda code
cd /tmp && zip lambda-function.zip lambda-index.js

# Wait for IAM role to propagate (important!)
echo "⏳ Waiting for IAM role to propagate (10 seconds)..."
sleep 10

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create Lambda function
aws lambda create-function \
  --function-name "$LAMBDA_FUNCTION" \
  --region "$REGION" \
  --runtime nodejs20.x \
  --role "arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}" \
  --handler index.handler \
  --zip-file fileb:///tmp/lambda-function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment "Variables={
    DYNAMODB_TABLE=${DYNAMODB_TABLE},
    S3_BUCKET=${S3_BUCKET},
    REGION=${REGION}
  }" \
  --tags Project=ZhiYeCompass,Environment=Production

echo "✅ Lambda function created: $LAMBDA_FUNCTION"
echo ""

# ============================================
# 5. API Gateway Setup
# ============================================
echo "🌐 Step 5: Creating API Gateway..."

# Create REST API
API_NAME="${PROJECT_NAME}-api"
API_ID=$(aws apigateway create-rest-api \
  --name "$API_NAME" \
  --description "ZhiYeCompass Recommendation API" \
  --region "$REGION" \
  --endpoint-configuration types=REGIONAL \
  --query 'id' \
  --output text)

echo "✅ API Gateway created: $API_NAME (ID: $API_ID)"
echo ""

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --query 'items[0].id' \
  --output text)

# Create /recommend resource
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --parent-id "$ROOT_ID" \
  --path-part "recommend" \
  --query 'id' \
  --output text)

# Create POST method
aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --authorization-type NONE

# Set up Lambda integration
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTION}"

aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations"

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name "$LAMBDA_FUNCTION" \
  --region "$REGION" \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*"

# Deploy API
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --stage-name prod \
  --stage-description "Production stage" \
  --description "Initial deployment"

API_ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo "✅ API Gateway deployed"
echo ""

# ============================================
# 6. Initialize System Configuration in DynamoDB
# ============================================
echo "⚙️ Step 6: Initializing system configuration..."

aws dynamodb put-item \
  --table-name "$DYNAMODB_TABLE" \
  --region "$REGION" \
  --item '{
    "PK": {"S": "CONFIG#SYSTEM"},
    "SK": {"S": "SETTINGS"},
    "hourly_limit": {"N": "10"},
    "llm_model": {"S": "claude"},
    "updated_at": {"S": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
  }'

echo "✅ System configuration initialized (hourly_limit: 10, llm_model: claude)"
echo ""

# ============================================
# Setup Complete!
# ============================================
echo ""
echo "═══════════════════════════════════════════════"
echo "🎉 AWS Setup Complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "📋 Resources Created:"
echo "  • DynamoDB Table: $DYNAMODB_TABLE"
echo "  • S3 Bucket: $S3_BUCKET"
echo "  • IAM Role: $ROLE_NAME"
echo "  • IAM Policy: $POLICY_NAME"
echo "  • Lambda Function: $LAMBDA_FUNCTION"
echo "  • API Gateway: $API_NAME"
echo ""
echo "🌐 API Endpoint:"
echo "  $API_ENDPOINT/recommend"
echo ""
echo "📝 Next Steps:"
echo "  1. Update .env with these values:"
echo "     DYNAMODB_TABLE=$DYNAMODB_TABLE"
echo "     S3_BUCKET=$S3_BUCKET"
echo "     AWS_REGION=$REGION"
echo "     API_ENDPOINT=$API_ENDPOINT"
echo ""
echo "  2. Implement Lambda function code (replace placeholder)"
echo "  3. Configure Bedrock access for LLM"
echo "  4. Test API endpoint with POST request"
echo ""
echo "💰 Cost Estimates (Monthly):"
echo "  • DynamoDB: ~$1-5 (pay per request, first 100 users)"
echo "  • S3: ~$0.50-2 (storage + requests)"
echo "  • Lambda: ~$0.20-1 (free tier covers most)"
echo "  • API Gateway: ~$3.50 (1M requests/month)"
echo "  • Bedrock Claude: ~$50-100 (depends on usage)"
echo "  Total: ~$55-110/month"
echo ""
echo "═══════════════════════════════════════════════"

# Clean up temp files
rm -f /tmp/lambda-trust-policy.json
rm -f /tmp/lambda-custom-policy.json
rm -f /tmp/lambda-index.js
rm -f /tmp/lambda-function.zip
