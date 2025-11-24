# AWS 环境配置指南

本文档提供 ZhiYeCompass 项目 AWS 环境配置的完整步骤。

## 📋 前置要求

- AWS 账号（推荐使用 ca-central-1 区域）
- AWS CLI 已安装并配置
- 基本的 AWS 服务使用经验

## 🏗️ 架构概览

```
用户浏览器
    ↓
Next.js 前端 (EC2)
    ↓
API Gateway
    ↓
Lambda 函数 (推荐引擎)
    ↓
┌─────────────┬──────────────┐
│  DynamoDB   │   S3 Bucket  │
│ (用户画像)   │ (推荐结果)    │
└─────────────┴──────────────┘
    ↓
AWS Bedrock (Claude 3.5 Sonnet)
```

---

## 1️⃣ AWS 账号和 IAM 用户设置

### 创建 IAM 用户

```bash
# 1. 登录 AWS Console
# https://console.aws.amazon.com/

# 2. 创建 IAM 用户
# IAM → Users → Add User
用户名: zhiyecompass-admin
访问类型: ✅ Programmatic access (Access key)

# 3. 附加权限策略
直接附加现有策略:
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess
- AWSLambda_FullAccess
- AmazonAPIGatewayAdministrator
- AmazonBedrockFullAccess

# 或创建自定义策略 (推荐 - 最小权限原则)
见下方 IAM 策略 JSON
```

### IAM 自定义策略（最小权限）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:ca-central-1:*:table/zhiyecompass-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::zhiyecompass-recommendations/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:ca-central-1:*:function:zhiyecompass-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:ca-central-1::foundation-model/anthropic.claude-3-5-sonnet-*"
    }
  ]
}
```

### 配置 AWS CLI

```bash
aws configure --profile zhiyecompass

# 输入凭证
AWS Access Key ID: [从 IAM 用户获取]
AWS Secret Access Key: [从 IAM 用户获取]
Default region name: ca-central-1
Default output format: json

# 验证配置
aws sts get-caller-identity --profile zhiyecompass
```

---

## 2️⃣ DynamoDB 单表设计

### 创建表

```bash
aws dynamodb create-table \
  --table-name zhiyecompass-main \
  --attribute-definitions \
      AttributeName=PK,AttributeType=S \
      AttributeName=SK,AttributeType=S \
  --key-schema \
      AttributeName=PK,KeyType=HASH \
      AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=ZhiYeCompass Key=Environment,Value=production \
  --region ca-central-1 \
  --profile zhiyecompass
```

### 表结构设计

| 访问模式 | PK | SK | 属性 |
|---------|----|----|------|
| 用户画像 | `USER#{uuid}` | `PROFILE` | `profile_data`, `recommendation_ids[]` |
| 推荐元数据 | `REC#{rec_id}` | `METADATA` | `user_uuid`, `s3_key`, `created_at`, `feedback` |
| 系统配置 | `CONFIG#SYSTEM` | `SETTINGS` | `hourly_limit`, `llm_model` |
| 每小时限额 | `QUOTA#{hour_ts}` | `COUNT` | `count`, TTL |
| 用户反馈 | `REC#{rec_id}` | `FEEDBACK` | `useful`, `comment` |

### 配置 TTL（自动过期）

```bash
aws dynamodb update-time-to-live \
  --table-name zhiyecompass-main \
  --time-to-live-specification \
      Enabled=true,AttributeName=ttl \
  --region ca-central-1 \
  --profile zhiyecompass
```

### 初始化系统配置

```bash
# 创建初始配置项
aws dynamodb put-item \
  --table-name zhiyecompass-main \
  --item '{
    "PK": {"S": "CONFIG#SYSTEM"},
    "SK": {"S": "SETTINGS"},
    "hourly_limit": {"N": "10"},
    "llm_model": {"S": "claude"},
    "updated_at": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }' \
  --region ca-central-1 \
  --profile zhiyecompass
```

---

## 3️⃣ S3 Bucket 配置

### 创建 Bucket

```bash
aws s3api create-bucket \
  --bucket zhiyecompass-recommendations \
  --region ca-central-1 \
  --create-bucket-configuration LocationConstraint=ca-central-1 \
  --profile zhiyecompass

# 添加标签
aws s3api put-bucket-tagging \
  --bucket zhiyecompass-recommendations \
  --tagging 'TagSet=[{Key=Project,Value=ZhiYeCompass},{Key=Environment,Value=production}]' \
  --region ca-central-1 \
  --profile zhiyecompass
```

### 配置 CORS（允许前端访问）

```bash
cat > cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket zhiyecompass-recommendations \
  --cors-configuration file://cors-config.json \
  --region ca-central-1 \
  --profile zhiyecompass
```

### 配置生命周期策略（成本优化）

```bash
cat > lifecycle-policy.json <<EOF
{
  "Rules": [
    {
      "Id": "ArchiveOldRecommendations",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        }
      ],
      "Prefix": "recommendations/"
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket zhiyecompass-recommendations \
  --lifecycle-configuration file://lifecycle-policy.json \
  --region ca-central-1 \
  --profile zhiyecompass
```

### 目录结构

```
zhiyecompass-recommendations/
├── recommendations/
│   ├── {uuid-1}.json    # 用户推荐结果
│   ├── {uuid-2}.json
│   └── ...
└── shared/
    ├── {uuid-1}.json    # 公开分享的推荐
    └── ...
```

---

## 4️⃣ Lambda 函数配置

### 创建 Lambda 执行角色

```bash
# 创建信任策略
cat > trust-policy.json <<EOF
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
EOF

# 创建角色
aws iam create-role \
  --role-name zhiyecompass-lambda-role \
  --assume-role-policy-document file://trust-policy.json \
  --profile zhiyecompass

# 附加权限策略
aws iam attach-role-policy \
  --role-name zhiyecompass-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --profile zhiyecompass

# 附加 DynamoDB 和 S3 权限
cat > lambda-permissions.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ca-central-1:*:table/zhiyecompass-main"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::zhiyecompass-recommendations/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:ca-central-1::foundation-model/anthropic.claude-*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name zhiyecompass-lambda-role \
  --policy-name zhiyecompass-lambda-permissions \
  --policy-document file://lambda-permissions.json \
  --profile zhiyecompass
```

### Lambda 函数占位符（后续实现）

```bash
# 创建部署包占位符
mkdir -p lambda/recommendation
cd lambda/recommendation

cat > index.mjs <<'EOF'
export const handler = async (event) => {
  // TODO: 实现推荐引擎逻辑
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Lambda function placeholder' })
  };
};
EOF

zip -r function.zip index.mjs

# 创建 Lambda 函数
aws lambda create-function \
  --function-name zhiyecompass-recommendation-engine \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/zhiyecompass-lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --region ca-central-1 \
  --profile zhiyecompass \
  --environment Variables="{DYNAMODB_TABLE=zhiyecompass-main,S3_BUCKET=zhiyecompass-recommendations}"
```

---

## 5️⃣ AWS Bedrock 配置

### 启用 Claude 3.5 Sonnet 模型访问

```bash
# 1. 登录 AWS Console
# 2. 导航到 Bedrock 服务
# 3. 选择区域: ca-central-1
# 4. Model access → Manage model access
# 5. 勾选 Anthropic Claude 3.5 Sonnet
# 6. Request model access

# 验证模型访问（CLI）
aws bedrock list-foundation-models \
  --region ca-central-1 \
  --profile zhiyecompass \
  --query "modelSummaries[?contains(modelId, 'claude-3-5')].{ModelId:modelId,Status:modelLifecycle.status}"
```

### 测试 Bedrock 调用

```bash
cat > test-bedrock-request.json <<EOF
{
  "modelId": "anthropic.claude-3-5-sonnet-20240620-v1:0",
  "contentType": "application/json",
  "accept": "application/json",
  "body": "{\"anthropic_version\":\"bedrock-2023-05-31\",\"max_tokens\":1024,\"messages\":[{\"role\":\"user\",\"content\":\"你好，请用中文回答：什么是副业？\"}]}"
}
EOF

aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-5-sonnet-20240620-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":1024,"messages":[{"role":"user","content":"你好，请用中文回答：什么是副业？"}]}' \
  --region ca-central-1 \
  --profile zhiyecompass \
  output.json

cat output.json
```

---

## 6️⃣ API Gateway 配置（可选，后续实现）

### 创建 REST API

```bash
aws apigateway create-rest-api \
  --name zhiyecompass-api \
  --description "ZhiYeCompass Recommendation API" \
  --region ca-central-1 \
  --profile zhiyecompass
```

---

## 🔐 环境变量配置

### 本地开发环境

创建 `.env.local` 文件：

```bash
# AWS 配置
AWS_REGION=ca-central-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB
DYNAMODB_TABLE_NAME=zhiyecompass-main

# S3
S3_BUCKET_NAME=zhiyecompass-recommendations

# Lambda
LAMBDA_FUNCTION_NAME=zhiyecompass-recommendation-engine

# Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

---

## 📊 成本估算（MVP 阶段 - 前 100 用户）

| 服务 | 用量 | 月成本（USD） |
|------|------|--------------|
| DynamoDB | 1000 读/写 | ~$0.50 |
| S3 | 5GB 存储 + 1000 请求 | ~$0.15 |
| Lambda | 1000 次调用 x 10s | ~$0.20 |
| Bedrock (Claude 3.5) | 100 次生成 x 2K tokens | ~$20-30 |
| API Gateway | 1000 请求 | ~$0.01 |
| **总计** | | **~$25-35/月** |

### 成本优化建议

1. **缓存策略**: 相同用户画像 24h 内复用 S3 结果
2. **Lambda 优化**: 减少冷启动，优化内存配置
3. **Bedrock 限流**: 每小时限额控制（默认 10 次/小时）
4. **S3 生命周期**: 90 天后转 IA 存储类

---

## ✅ 验证清单

完成以上配置后，请验证：

- [ ] IAM 用户创建成功，凭证可用
- [ ] DynamoDB 表创建成功，可读写
- [ ] S3 Bucket 创建成功，CORS 配置正确
- [ ] Lambda 函数创建成功，角色权限正确
- [ ] Bedrock Claude 3.5 模型访问已批准
- [ ] 环境变量文件 `.env.local` 已创建
- [ ] AWS CLI 配置正确，profile `zhiyecompass` 可用

---

## 🆘 故障排查

### DynamoDB 访问被拒绝

```bash
# 检查 IAM 角色权限
aws iam get-role-policy \
  --role-name zhiyecompass-lambda-role \
  --policy-name zhiyecompass-lambda-permissions \
  --profile zhiyecompass
```

### S3 CORS 错误

```bash
# 验证 CORS 配置
aws s3api get-bucket-cors \
  --bucket zhiyecompass-recommendations \
  --region ca-central-1 \
  --profile zhiyecompass
```

### Bedrock 模型不可用

```bash
# 检查模型访问状态
aws bedrock list-foundation-models \
  --region ca-central-1 \
  --profile zhiyecompass \
  --query "modelSummaries[?contains(modelId, 'claude')]"
```

---

## 📝 下一步

完成 AWS 环境配置后，继续以下任务：

1. 实现用户画像表单（参考 TASK.md）
2. 开发 Lambda 推荐引擎（Day 5-7）
3. 集成前端与后端 API

详细开发流程请参考 [TASK.md](../TASK.md)
