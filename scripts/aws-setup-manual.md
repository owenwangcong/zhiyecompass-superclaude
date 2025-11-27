# AWS 环境配置手册 (PowerShell + OpenAI)

本手册使用 **OpenAI ChatGPT** 作为 LLM 提供商，API 密钥安全存储在 **AWS Secrets Manager** 中。

## 前置条件

### 1. 安装 AWS CLI

**Windows (推荐方式):**
```powershell
# 使用 winget 安装
winget install Amazon.AWSCLI

# 或下载 MSI 安装包
# https://awscli.amazonaws.com/AWSCLIV2.msi
```

### 2. 验证安装
```powershell
aws --version
# 应该显示: aws-cli/2.x.x Python/3.x.x ...
```

### 3. 获取 OpenAI API Key

1. 访问 https://platform.openai.com/api-keys
2. 登录或创建 OpenAI 账号
3. 点击 "Create new secret key"
4. 复制并保存 API key（以 `sk-` 开头）

**重要**: API key 只显示一次，请妥善保存！

## 配置 AWS 凭证

### 1. 创建 AWS 账号
1. 访问 https://aws.amazon.com/
2. 点击 "创建 AWS 账户"
3. 按照提示完成注册（需要信用卡）

### 2. 创建 IAM 用户
1. 登录 AWS Console
2. 进入 IAM 服务
3. 点击 "用户" → "添加用户"
4. 用户名: `zhiyecompass-admin`
5. 访问类型: 选择 "编程访问"
6. 权限: 选择 "直接附加现有策略"
   - AdministratorAccess (开发环境)
   - 或创建自定义策略（生产环境推荐）
7. 完成创建，**保存 Access Key ID 和 Secret Access Key**

### 3. 配置 AWS CLI
```powershell
aws configure

# 输入以下信息:
# AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
# AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
# Default region name [None]: ca-central-1
# Default output format [None]: json
```

### 4. 验证配置
```powershell
aws sts get-caller-identity

# 应该显示你的账号信息:
# {
#   "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/zhiyecompass-admin"
# }
```

## 自动化安装脚本

### 运行安装脚本

**PowerShell:**
```powershell
# 设置执行策略（如果需要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 运行脚本
.\scripts\aws-setup.ps1

# 脚本会提示输入 OpenAI API Key
```

### 脚本执行内容

脚本会自动创建以下资源：

1. **DynamoDB 表** (`zhiyecompass-main`)
   - 单表设计，支持多种数据访问模式
   - 按需计费模式
   - 启用 Point-in-Time Recovery
   - 启用 TTL (自动过期限额记录)

2. **S3 存储桶** (`zhiyecompass-recommendations`)
   - 启用版本控制
   - 启用服务器端加密
   - 阻止公共访问
   - 配置 CORS (允许前端访问)
   - 生命周期策略 (90天后转到低频存储)

3. **AWS Secrets Manager**
   - 安全存储 OpenAI API Key
   - 密钥名称: `zhiyecompass/openai-api-key`

4. **IAM 角色和策略**
   - Lambda 执行角色
   - DynamoDB 访问权限
   - S3 访问权限
   - Secrets Manager 读取权限（获取 OpenAI API Key）

5. **Lambda 函数** (`zhiyecompass-recommendation-engine`)
   - Node.js 20.x 运行时
   - 30秒超时
   - 512MB 内存
   - 环境变量已配置（OpenAI model: gpt-4o）

6. **API Gateway**
   - REST API
   - `/recommend` 端点 (POST)
   - Lambda 代理集成
   - 生产环境部署

7. **系统配置初始化**
   - 每小时限额: 10
   - LLM 模型: gpt-4o
   - LLM 提供商: openai

### 执行时间
整个脚本执行大约需要 **2-3 分钟**。

## 手动配置步骤

如果不想使用自动化脚本，可以按照以下步骤手动配置：

### 1. DynamoDB 表

```powershell
aws dynamodb create-table `
  --table-name zhiyecompass-main `
  --region ca-central-1 `
  --attribute-definitions `
    AttributeName=PK,AttributeType=S `
    AttributeName=SK,AttributeType=S `
  --key-schema `
    AttributeName=PK,KeyType=HASH `
    AttributeName=SK,KeyType=RANGE `
  --billing-mode PAY_PER_REQUEST
```

### 2. S3 存储桶

```powershell
aws s3api create-bucket `
  --bucket zhiyecompass-recommendations `
  --region ca-central-1 `
  --create-bucket-configuration LocationConstraint=ca-central-1
```

### 3. 存储 OpenAI API Key

```powershell
# 创建密钥（将 YOUR_OPENAI_API_KEY 替换为你的实际 API Key）
$secretValue = '{"OPENAI_API_KEY":"YOUR_OPENAI_API_KEY"}'

aws secretsmanager create-secret `
  --name zhiyecompass/openai-api-key `
  --region ca-central-1 `
  --description "OpenAI API key for ZhiYeCompass" `
  --secret-string $secretValue
```

### 4. 其他资源

参考 `scripts\aws-setup.ps1` 中的详细命令。

## 验证安装

### 1. 检查 DynamoDB 表
```powershell
aws dynamodb describe-table `
  --table-name zhiyecompass-main `
  --region ca-central-1 `
  --query 'Table.TableStatus'

# 应该返回: "ACTIVE"
```

### 2. 检查 S3 存储桶
```powershell
aws s3 ls s3://zhiyecompass-recommendations/

# 应该显示:
#            PRE recommendations/
#            PRE shared/
```

### 3. 检查 Secrets Manager
```powershell
aws secretsmanager describe-secret `
  --secret-id zhiyecompass/openai-api-key `
  --region ca-central-1 `
  --query 'Name'

# 应该返回: "zhiyecompass/openai-api-key"
```

### 4. 检查 Lambda 函数
```powershell
aws lambda get-function `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --query 'Configuration.State'

# 应该返回: "Active"
```

### 5. 测试 API 端点
```powershell
# 获取 API 端点
$API_ID = aws apigateway get-rest-apis `
  --region ca-central-1 `
  --query "items[?name=='zhiyecompass-api'].id" `
  --output text

$API_ENDPOINT = "https://$API_ID.execute-api.ca-central-1.amazonaws.com/prod"

Write-Host "API Endpoint: $API_ENDPOINT/recommend"

# 测试 API
$body = @{
    uuid = "test-user-123"
    profile = @{
        ageRange = "25-30岁"
        location = "北京"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_ENDPOINT/recommend" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# 应该返回 JSON 响应
```

## 配置环境变量

将以下内容添加到项目的 `.env.local` 文件：

```powershell
# AWS Configuration
AWS_REGION=ca-central-1
DYNAMODB_TABLE=zhiyecompass-main
S3_BUCKET=zhiyecompass-recommendations

# API Gateway
API_ENDPOINT=https://YOUR_API_ID.execute-api.ca-central-1.amazonaws.com/prod

# Lambda (本地开发时使用)
LAMBDA_FUNCTION_NAME=zhiyecompass-recommendation-engine

# OpenAI Configuration
OPENAI_SECRET_NAME=zhiyecompass/openai-api-key
OPENAI_MODEL=gpt-4o
```

**重要**: 将 `YOUR_API_ID` 替换为实际的 API Gateway ID。

获取 API ID:
```powershell
aws apigateway get-rest-apis `
  --region ca-central-1 `
  --query "items[?name=='zhiyecompass-api'].id" `
  --output text
```

## OpenAI 配置说明

### 支持的模型

| 模型 | 说明 | 推荐场景 |
|------|------|----------|
| `gpt-4o` | 最新的 GPT-4 Omni 模型 | **默认推荐**，性价比高 |
| `gpt-4o-mini` | 轻量版 GPT-4o | 成本敏感场景 |
| `gpt-4-turbo` | GPT-4 Turbo | 需要更长上下文 |
| `gpt-3.5-turbo` | GPT-3.5 | 预算有限 |

### 修改模型配置

```powershell
# 更新 Lambda 环境变量
aws lambda update-function-configuration `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --environment "Variables={DYNAMODB_TABLE=zhiyecompass-main,S3_BUCKET=zhiyecompass-recommendations,REGION=ca-central-1,OPENAI_SECRET_NAME=zhiyecompass/openai-api-key,OPENAI_MODEL=gpt-4o-mini}"
```

### 更新 OpenAI API Key

```powershell
# 更新 Secrets Manager 中的密钥
$newSecretValue = '{"OPENAI_API_KEY":"sk-your-new-api-key"}'

aws secretsmanager update-secret `
  --secret-id zhiyecompass/openai-api-key `
  --region ca-central-1 `
  --secret-string $newSecretValue
```

### 测试 OpenAI 连接（本地）

```powershell
# 使用 PowerShell 测试 OpenAI API
$headers = @{
    "Authorization" = "Bearer sk-your-api-key"
    "Content-Type" = "application/json"
}

$body = @{
    model = "gpt-4o"
    messages = @(
        @{
            role = "user"
            content = "Hello, how are you?"
        }
    )
    max_tokens = 100
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

## 成本估算

### 免费套餐 (前12个月)
- DynamoDB: 25GB 存储 + 25 WCU + 25 RCU
- S3: 5GB 存储 + 20,000 GET + 2,000 PUT
- Lambda: 100万次请求 + 400,000 GB-秒计算时间
- API Gateway: 100万次调用
- Secrets Manager: 无免费套餐

### 超出免费套餐后 (月估算)
基于 100 活跃用户，每天 10 次推荐：

| 服务 | 用量 | 成本 |
|------|------|------|
| DynamoDB | ~1000 读/写请求/天 | $1-5 |
| S3 | ~500MB 存储 + 1000 请求/天 | $0.50-2 |
| Lambda | ~1000 次调用/天 | $0.20-1 |
| API Gateway | ~30,000 次/月 | $0.10-0.50 |
| Secrets Manager | 1 个密钥 | $0.40 |
| **OpenAI GPT-4o** | ~1000 次调用/天 (2K tokens/次) | **$30-80** |
| **总计** | | **~$35-90/月** |

### OpenAI 定价参考 (2024)

| 模型 | 输入 (1M tokens) | 输出 (1M tokens) |
|------|------------------|------------------|
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4-turbo | $10.00 | $30.00 |
| gpt-3.5-turbo | $0.50 | $1.50 |

### 成本优化建议
1. 使用 `gpt-4o-mini` 代替 `gpt-4o` 可降低 90% LLM 成本
2. 缓存相同用户画像的推荐结果 (24小时)
3. 优化 prompt 减少 token 使用
4. 使用 S3 生命周期策略 (90天后转低频存储)

## 清理资源

如果需要删除所有资源，运行：

```powershell
# 删除 API Gateway
$API_ID = aws apigateway get-rest-apis `
  --region ca-central-1 `
  --query "items[?name=='zhiyecompass-api'].id" `
  --output text

aws apigateway delete-rest-api --rest-api-id $API_ID --region ca-central-1

# 删除 Lambda
aws lambda delete-function `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1

# 删除 Secrets Manager 密钥
aws secretsmanager delete-secret `
  --secret-id zhiyecompass/openai-api-key `
  --region ca-central-1 `
  --force-delete-without-recovery

# 删除 IAM 策略和角色
aws iam detach-role-policy `
  --role-name zhiyecompass-lambda-role `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

$POLICY_ARN = aws iam list-policies `
  --query "Policies[?PolicyName=='zhiyecompass-lambda-policy'].Arn" `
  --output text

aws iam detach-role-policy `
  --role-name zhiyecompass-lambda-role `
  --policy-arn $POLICY_ARN

aws iam delete-policy --policy-arn $POLICY_ARN
aws iam delete-role --role-name zhiyecompass-lambda-role

# 清空并删除 S3 存储桶
aws s3 rm s3://zhiyecompass-recommendations --recursive
aws s3api delete-bucket `
  --bucket zhiyecompass-recommendations `
  --region ca-central-1

# 删除 DynamoDB 表
aws dynamodb delete-table `
  --table-name zhiyecompass-main `
  --region ca-central-1
```

## 故障排查

### 问题: AWS CLI 命令无权限

**解决方案:**
```powershell
# 检查当前用户权限
aws iam get-user

# 确保 IAM 用户有足够权限
# 需要的权限: DynamoDB, S3, Lambda, IAM, API Gateway, Secrets Manager
```

### 问题: Lambda 函数无法访问 Secrets Manager

**解决方案:**
```powershell
# 检查 Lambda 执行角色
aws lambda get-function-configuration `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --query 'Role'

# 检查角色策略是否包含 secretsmanager:GetSecretValue
aws iam list-attached-role-policies `
  --role-name zhiyecompass-lambda-role
```

### 问题: OpenAI API 返回 401 错误

**解决方案:**
1. 检查 API Key 是否正确存储在 Secrets Manager
2. 确认 API Key 未过期或被撤销
3. 验证 OpenAI 账户余额

```powershell
# 获取并检查密钥（注意：会显示敏感信息）
aws secretsmanager get-secret-value `
  --secret-id zhiyecompass/openai-api-key `
  --region ca-central-1 `
  --query 'SecretString'
```

### 问题: API Gateway 502 错误

**解决方案:**
```powershell
# 检查 Lambda 日志
aws logs tail /aws/lambda/zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --follow

# 测试 Lambda 直接调用
aws lambda invoke `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --payload '{}' `
  output.json

Get-Content output.json
```

### 问题: OpenAI 请求超时

**解决方案:**
```powershell
# 增加 Lambda 超时时间
aws lambda update-function-configuration `
  --function-name zhiyecompass-recommendation-engine `
  --region ca-central-1 `
  --timeout 60
```

## 下一步

1. ✅ AWS 环境配置完成
2. ✅ OpenAI API Key 配置完成
3. 实现 Lambda 推荐引擎函数（调用 OpenAI API）
4. 实现前端用户画像表单
5. 集成 API 调用
6. 测试完整流程
