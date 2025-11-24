# AWS 环境配置手册

## 前置条件

### 1. 安装 AWS CLI

**Windows:**
```powershell
# 下载并安装 AWS CLI MSI installer
# https://awscli.amazonaws.com/AWSCLIV2.msi

# 或使用 winget
winget install Amazon.AWSCLI
```

**macOS:**
```bash
# 使用 Homebrew
brew install awscli

# 或下载安装包
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. 验证安装
```bash
aws --version
# 应该显示: aws-cli/2.x.x Python/3.x.x ...
```

### 3. 安装 jq (JSON 处理工具)

**Windows:**
```powershell
winget install jqlang.jq
```

**macOS:**
```bash
brew install jq
```

**Linux:**
```bash
sudo apt-get install jq  # Debian/Ubuntu
sudo yum install jq      # CentOS/RHEL
```

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
```bash
aws configure

# 输入以下信息:
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: ca-central-1
Default output format [None]: json
```

### 4. 验证配置
```bash
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

**Unix/Linux/macOS:**
```bash
# 给脚本执行权限
chmod +x scripts/aws-setup.sh

# 运行脚本
./scripts/aws-setup.sh
```

**Windows (Git Bash):**
```bash
# 在 Git Bash 中运行
bash scripts/aws-setup.sh
```

**Windows (PowerShell) - 需要转换:**
```powershell
# 如果遇到换行符问题，先转换脚本
# 或使用 WSL (Windows Subsystem for Linux)
wsl bash scripts/aws-setup.sh
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

3. **IAM 角色和策略**
   - Lambda 执行角色
   - DynamoDB 访问权限
   - S3 访问权限
   - Bedrock (Claude) 调用权限

4. **Lambda 函数** (`zhiyecompass-recommendation-engine`)
   - Node.js 20.x 运行时
   - 30秒超时
   - 512MB 内存
   - 环境变量已配置

5. **API Gateway**
   - REST API
   - `/recommend` 端点 (POST)
   - Lambda 代理集成
   - 生产环境部署

6. **系统配置初始化**
   - 每小时限额: 10
   - LLM 模型: claude

### 执行时间
整个脚本执行大约需要 **2-3 分钟**。

## 手动配置步骤

如果不想使用自动化脚本，可以按照以下步骤手动配置：

### 1. DynamoDB 表

```bash
aws dynamodb create-table \
  --table-name zhiyecompass-main \
  --region ca-central-1 \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### 2. S3 存储桶

```bash
aws s3api create-bucket \
  --bucket zhiyecompass-recommendations \
  --region ca-central-1 \
  --create-bucket-configuration LocationConstraint=ca-central-1
```

### 3. 其他资源

参考 `scripts/aws-setup.sh` 中的详细命令。

## 验证安装

### 1. 检查 DynamoDB 表
```bash
aws dynamodb describe-table \
  --table-name zhiyecompass-main \
  --region ca-central-1 \
  --query 'Table.TableStatus'

# 应该返回: "ACTIVE"
```

### 2. 检查 S3 存储桶
```bash
aws s3 ls s3://zhiyecompass-recommendations/

# 应该显示:
#            PRE recommendations/
#            PRE shared/
```

### 3. 检查 Lambda 函数
```bash
aws lambda get-function \
  --function-name zhiyecompass-recommendation-engine \
  --region ca-central-1 \
  --query 'Configuration.State'

# 应该返回: "Active"
```

### 4. 测试 API 端点
```bash
# 获取 API 端点
API_ID=$(aws apigateway get-rest-apis \
  --region ca-central-1 \
  --query 'items[?name==`zhiyecompass-api`].id' \
  --output text)

API_ENDPOINT="https://${API_ID}.execute-api.ca-central-1.amazonaws.com/prod"

echo "API Endpoint: $API_ENDPOINT/recommend"

# 测试 API
curl -X POST "$API_ENDPOINT/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "test-user-123",
    "profile": {
      "ageRange": "25-30岁",
      "location": "北京"
    }
  }'

# 应该返回 JSON 响应
```

## 配置环境变量

将以下内容添加到项目的 `.env.local` 文件：

```bash
# AWS Configuration
AWS_REGION=ca-central-1
DYNAMODB_TABLE=zhiyecompass-main
S3_BUCKET=zhiyecompass-recommendations

# API Gateway
API_ENDPOINT=https://YOUR_API_ID.execute-api.ca-central-1.amazonaws.com/prod

# Lambda (本地开发时使用)
LAMBDA_FUNCTION_NAME=zhiyecompass-recommendation-engine

# Bedrock (LLM)
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

**重要**: 将 `YOUR_API_ID` 替换为实际的 API Gateway ID。

获取 API ID:
```bash
aws apigateway get-rest-apis \
  --region ca-central-1 \
  --query 'items[?name==`zhiyecompass-api`].id' \
  --output text
```

## 配置 Bedrock 访问

### 1. 启用 Bedrock
1. 登录 AWS Console
2. 进入 Bedrock 服务
3. 选择 `ca-central-1` 区域
4. 点击 "Model access"
5. 请求访问 "Claude 3.5 Sonnet"

### 2. 等待批准
通常需要几分钟到几小时。批准后即可使用。

### 3. 测试 Bedrock
```bash
aws bedrock-runtime invoke-model \
  --region ca-central-1 \
  --model-id anthropic.claude-3-5-sonnet-20240620-v1:0 \
  --body '{"prompt":"Human: Hello\n\nAssistant:","max_tokens_to_sample":100}' \
  --cli-binary-format raw-in-base64-out \
  output.json

cat output.json
```

## 成本估算

### 免费套餐 (前12个月)
- DynamoDB: 25GB 存储 + 25 WCU + 25 RCU
- S3: 5GB 存储 + 20,000 GET + 2,000 PUT
- Lambda: 100万次请求 + 400,000 GB-秒计算时间
- API Gateway: 100万次调用

### 超出免费套餐后 (月估算)
基于 100 活跃用户，每天 10 次推荐：

| 服务 | 用量 | 成本 |
|------|------|------|
| DynamoDB | ~1000 读/写请求/天 | $1-5 |
| S3 | ~500MB 存储 + 1000 请求/天 | $0.50-2 |
| Lambda | ~1000 次调用/天 | $0.20-1 |
| API Gateway | ~30,000 次/月 | $0.10-0.50 |
| Bedrock Claude | ~1000 次调用/天 (10K tokens/次) | $50-100 |
| **总计** | | **~$52-109/月** |

### 成本优化建议
1. 使用 S3 生命周期策略 (90天后转低频存储)
2. 启用 DynamoDB 自动扩展
3. Lambda 预留并发 (高流量时)
4. 缓存相同用户画像的推荐结果 (24小时)

## 清理资源

如果需要删除所有资源，运行：

```bash
# 删除 API Gateway
API_ID=$(aws apigateway get-rest-apis \
  --region ca-central-1 \
  --query 'items[?name==`zhiyecompass-api`].id' \
  --output text)
aws apigateway delete-rest-api --rest-api-id "$API_ID" --region ca-central-1

# 删除 Lambda
aws lambda delete-function \
  --function-name zhiyecompass-recommendation-engine \
  --region ca-central-1

# 删除 IAM 策略和角色
aws iam detach-role-policy \
  --role-name zhiyecompass-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

POLICY_ARN=$(aws iam list-policies \
  --query 'Policies[?PolicyName==`zhiyecompass-lambda-policy`].Arn' \
  --output text)
aws iam detach-role-policy \
  --role-name zhiyecompass-lambda-role \
  --policy-arn "$POLICY_ARN"

aws iam delete-policy --policy-arn "$POLICY_ARN"
aws iam delete-role --role-name zhiyecompass-lambda-role

# 清空并删除 S3 存储桶
aws s3 rm s3://zhiyecompass-recommendations --recursive
aws s3api delete-bucket \
  --bucket zhiyecompass-recommendations \
  --region ca-central-1

# 删除 DynamoDB 表
aws dynamodb delete-table \
  --table-name zhiyecompass-main \
  --region ca-central-1
```

## 故障排查

### 问题: AWS CLI 命令无权限

**解决方案:**
```bash
# 检查当前用户权限
aws iam get-user

# 确保 IAM 用户有足够权限
# 需要的权限: DynamoDB, S3, Lambda, IAM, API Gateway, Bedrock
```

### 问题: Lambda 函数无法访问 DynamoDB

**解决方案:**
```bash
# 检查 Lambda 执行角色
aws lambda get-function-configuration \
  --function-name zhiyecompass-recommendation-engine \
  --region ca-central-1 \
  --query 'Role'

# 检查角色策略
aws iam list-attached-role-policies \
  --role-name zhiyecompass-lambda-role
```

### 问题: API Gateway 502 错误

**解决方案:**
```bash
# 检查 Lambda 日志
aws logs tail /aws/lambda/zhiyecompass-recommendation-engine \
  --region ca-central-1 \
  --follow

# 测试 Lambda 直接调用
aws lambda invoke \
  --function-name zhiyecompass-recommendation-engine \
  --region ca-central-1 \
  --payload '{}' \
  output.json

cat output.json
```

### 问题: Bedrock 访问被拒绝

**解决方案:**
1. 确认已在 Bedrock 控制台请求模型访问
2. 确认请求已被批准
3. 检查 IAM 角色是否有 `bedrock:InvokeModel` 权限

## 下一步

1. ✅ AWS 环境配置完成
2. 实现 Lambda 推荐引擎函数
3. 实现前端用户画像表单
4. 集成 API 调用
5. 测试完整流程
