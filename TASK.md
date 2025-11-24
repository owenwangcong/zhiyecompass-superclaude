# 智业罗盘 - 任务看板

## 当前迭代: MVP v0.1 (Sprint 1 - 2周)

### Must Have (P0) - 核心功能

#### 1. 项目初始化 (Day 1-2)
- [ ] Next.js 14项目搭建
  - [ ] 创建项目：`npx create-next-app@latest zhiyecompass`
  - [ ] 配置TypeScript严格模式
  - [ ] 配置ESLint + Prettier
- [ ] shadcn/ui组件库集成
  - [ ] 安装shadcn/ui CLI
  - [ ] 配置Tailwind CSS
  - [ ] 初始化组件库（Button, Card, Form, Input, Select等）
- [ ] AWS环境配置 (ca-central-1)
  - [ ] 创建AWS账号和IAM用户
  - [ ] 配置DynamoDB表（单表设计）
  - [ ] 配置S3 Bucket（推荐结果存储）
  - [ ] 配置Lambda函数基础架构
  - [ ] 配置Bedrock/LLM API访问权限
- [ ] Git仓库设置
  - [ ] 初始化Git仓库
  - [ ] 配置.gitignore
  - [ ] 创建开发分支策略

#### 2. 用户画像表单页面 (Day 3-4)
- [ ] 设计8个核心字段的表单组件
  - [ ] 年龄段选择（Select）
  - [ ] 地域选择（级联Select：省/市/城市等级）
  - [ ] 当前状态（Radio Group）
  - [ ] 学历（Select）
  - [ ] 行业背景（Multi-Select）
  - [ ] 技能选择（Multi-Select with Categories）
  - [ ] 可用时间（Number Input + Select）
  - [ ] 启动资金（Select）
- [ ] UUID生成和存储
  - [ ] 生成UUID（首次访问）
  - [ ] 存储到Session Storage
  - [ ] 存储到Cookie（7天有效期）
- [ ] 集成React Hook Form + Zod校验
  - [ ] 定义Zod Schema
  - [ ] 表单校验规则（必填、格式验证）
  - [ ] 错误提示优化
- [ ] 实现单页表单（非分步）
  - [ ] 统一页面布局
  - [ ] 提交按钮和Loading状态
- [ ] 数据提交到后端
  - [ ] API Route: `/api/submit-profile` (POST)
  - [ ] 调用Lambda生成推荐
  - [ ] 提交后跳转推荐详情页

#### 3. LLM推荐引擎Lambda函数 (Day 5-7)
- [ ] 实现推荐生成Lambda
  - [ ] 接收用户画像JSON
  - [ ] **检查每小时限额**（从DynamoDB读取计数）
  - [ ] **超限处理**：返回友好错误提示
  - [ ] 调用LLM生成完整项目推荐
  - [ ] 存储推荐结果到S3 (JSON格式)
  - [ ] DynamoDB记录推荐ID和用户UUID关联
  - [ ] **限额计数器递增**

- [ ] 多LLM支持（可动态切换）
  - [ ] Claude 3.5 Sonnet (Bedrock) - 默认
  - [ ] OpenAI GPT-4 (API)
  - [ ] DeepSeek (API)
  - [ ] 从DynamoDB读取当前LLM配置

- [ ] Prompt工程
  - [ ] 设计项目生成Prompt模板
  - [ ] 要求包含：项目描述、收益预期、启动成本、工作内容
  - [ ] **风险评估部分**：法律、财务、平台、竞争风险 + 规避建议
  - [ ] 行动路径（分阶段里程碑）
  - [ ] 成功和失败案例各1个
  - [ ] **明确禁止**：灰产、传销、诈骗、违规金融

- [ ] 错误处理和降级策略
  - [ ] LLM API失败：返回友好错误，建议稍后再试
  - [ ] S3存储失败：重试3次
  - [ ] 日志记录（CloudWatch）

#### 4. 单项目推荐页面 (Day 8-10)
- [ ] 推荐详情页 (`/recommendation/:id`)
  - [ ] 从URL参数获取推荐ID
  - [ ] 从S3加载推荐JSON
  - [ ] Server Component数据获取

- [ ] 完整项目信息展示
  - [ ] 项目标题和一句话描述
  - [ ] 详细项目描述
  - [ ] 收益预期（月收入范围、回本周期）
  - [ ] 启动成本
  - [ ] 日常工作内容
  - [ ] 成功关键因素

- [ ] **风险提示模块**（重点展示）
  - [ ] 法律风险卡片（红色/警告色）
  - [ ] 财务风险卡片
  - [ ] 平台风险卡片
  - [ ] 竞争风险卡片
  - [ ] **风险规避建议**列表（可执行的具体措施）

- [ ] 行动路径时间轴组件
  - [ ] 阶段性里程碑展示（Step 1/2/3...）
  - [ ] 每个阶段的任务列表
  - [ ] 预计时间显示

- [ ] 案例展示
  - [ ] 成功案例（可折叠）
  - [ ] **失败案例**（默认展开，重点展示）
  - [ ] 经验教训总结

- [ ] 操作按钮
  - [ ] "重新生成推荐"按钮（生成新的不同项目）
  - [ ] "分享"按钮
  - [ ] "有用/无用"反馈按钮

- [ ] 移动端适配
  - [ ] 响应式布局
  - [ ] 风险卡片堆叠显示

#### 5. 历史推荐浏览功能 (Day 11)
- [ ] 历史页面 (`/history`)
  - [ ] 从Session Storage读取推荐ID列表
  - [ ] 如果为空：提示"暂无历史推荐"
  - [ ] 批量从S3获取推荐内容

- [ ] 历史推荐列表
  - [ ] 卡片式列表展示
  - [ ] 显示：项目标题、生成时间、简短描述
  - [ ] 点击跳转详情页 (`/recommendation/:id`)

- [ ] UUID管理
  - [ ] 每次生成推荐后，将ID追加到Session Storage列表
  - [ ] Cookie同步（防止Session丢失）

#### 6. 推荐分享功能 (Day 12)
- [ ] 分享链接生成
  - [ ] 分享按钮点击：复制分享链接
  - [ ] 链接格式：`/share/:id`
  - [ ] 提示："链接已复制，分享给好友吧！"

- [ ] 分享页面 (`/share/:id`)
  - [ ] 公开访问（无需UUID验证）
  - [ ] 从S3加载推荐内容
  - [ ] 与推荐详情页相同的展示
  - [ ] 底部引导："生成你的专属推荐"（CTA按钮）

- [ ] 分享追踪
  - [ ] 记录分享来源（可选，DynamoDB）
  - [ ] 统计分享次数

#### 7. 简单后台管理 (Day 13-14)
- [ ] 后台认证
  - [ ] 简单的用户名/密码认证（环境变量配置）
  - [ ] Next-Auth集成（仅后台使用）

- [ ] 系统配置页面 (`/admin`)
  - [ ] **每小时推荐限额设置**（Number Input，保存到DynamoDB）
  - [ ] **LLM模型选择**（Radio Group：Claude/GPT-4/DeepSeek）
  - [ ] 配置保存和读取

- [ ] 推荐统计页面 (`/admin/stats`)
  - [ ] 累计推荐数
  - [ ] 今日推荐数
  - [ ] 当前小时已推荐次数 / 限额
  - [ ] 分享次数统计

- [ ] 用户反馈查看
  - [ ] 反馈列表（有用/无用统计）
  - [ ] 按时间排序

#### 8. 每小时限额控制 (集成到Lambda)
- [ ] DynamoDB限额计数器设计
  - [ ] 数据结构：`QUOTA#{hour_timestamp}`
  - [ ] 存储当前小时的推荐计数
  - [ ] TTL自动过期（每小时重置）

- [ ] 限额检查逻辑
  - [ ] Lambda开始时检查当前小时计数
  - [ ] 如果 `count >= limit`：返回错误
  - [ ] 否则：继续生成推荐并递增计数

- [ ] 前端限额提示
  - [ ] API返回限额错误时，显示友好提示
  - [ ] "本小时推荐额度已用完（X/Y），请下一个小时再试"
  - [ ] 显示下一个整点时间

---

### Should Have (P1) - 重要但非阻塞

- [ ] 反馈机制优化 (1天)
  - [ ] 详细反馈表单（除了有用/无用，还可以填写原因）
  - [ ] 反馈数据存储到DynamoDB

- [ ] SEO优化 (1天)
  - [ ] Meta标签配置
  - [ ] Open Graph标签（分享预览）
  - [ ] sitemap.xml生成

- [ ] 移动端深度适配 (2天)
  - [ ] PWA支持（manifest.json）
  - [ ] 移动端手势优化
  - [ ] 底部导航栏

- [ ] 性能优化
  - [ ] S3缓存机制（相同画像24h内复用）
  - [ ] 前端Bundle Size优化
  - [ ] 图片懒加载

---

### Could Have (P2) - 可选功能

- [ ] 推荐收藏功能（需要Cookie持久化）
- [ ] 更丰富的数据埋点（用户行为分析）
- [ ] 推荐结果PDF导出

---

### Won't Have This Sprint - 明确排除

- ❌ 用户登录/注册系统（MVP完全无需登录）
- ❌ 预置项目库和数据导入脚本（完全LLM生成）
- ❌ 推荐列表页（MVP只推荐一个项目）
- ❌ 社区评论功能
- ❌ 支付功能
- ❌ 用户画像编辑功能（提交后不可修改）

---

## 技术债务追踪

### 性能优化
- [ ] S3缓存策略优化（相同画像Hash匹配）
- [ ] DynamoDB查询性能优化（当推荐数>1000时）
- [ ] 前端Bundle Size优化（目标首页<200KB）

### 成本监控
- [ ] LLM API调用成本监控
  - 设置AWS Budgets告警
  - Dashboard可视化Token使用量和成本
- [ ] S3存储成本监控（按月统计）

### 代码质量
- [ ] 添加单元测试覆盖
  - 目标：核心逻辑>80%覆盖率
  - Lambda函数测试

- [ ] E2E测试覆盖
  - Playwright测试：用户完整流程
  - 推荐生成测试（Mock LLM）

---

## 数据模型设计（DynamoDB单表）

### 访问模式
```typescript
// 1. 用户UUID → 推荐ID列表
PK = USER#{uuid}
SK = PROFILE
Attributes: { profile_data, recommendation_ids: [] }

// 2. 推荐ID → 元数据（S3路径）
PK = REC#{recommendation_id}
SK = METADATA
Attributes: { user_uuid, s3_key, created_at, feedback }

// 3. 系统配置
PK = CONFIG#SYSTEM
SK = SETTINGS
Attributes: { hourly_limit: 10, llm_model: "claude" }

// 4. 每小时限额计数
PK = QUOTA#{hour_timestamp}  // 例如: QUOTA#2024-01-15T10
SK = COUNT
Attributes: { count: 5 }
TTL: hour_timestamp + 3600

// 5. 用户反馈
PK = REC#{recommendation_id}
SK = FEEDBACK
Attributes: { useful: true/false, comment: "" }
```

### S3存储结构
```
zhiyecompass-recommendations/
├─ recommendations/
│  ├─ {uuid-1}.json  # 推荐结果JSON
│  ├─ {uuid-2}.json
│  └─ ...
└─ shared/
   ├─ {uuid-1}.json  # 公开分享的推荐（同内容，方便追踪）
   └─ ...
```

---

## LLM Prompt模板（参考）

```
你是一个专业的副业/创业推荐顾问，专注于中国市场。

用户画像：
- 年龄段：{age_range}
- 地域：{location}
- 当前状态：{current_status}
- 学历：{education}
- 行业背景：{industry}
- 技能：{skills}
- 可用时间：{time}小时/周
- 启动资金：{budget}元

请为用户推荐1个最匹配的副业/创业项目。输出JSON格式，包含以下字段：

{
  "title": "项目名称",
  "summary": "一句话描述（不超过30字）",
  "description": "详细项目描述（200-300字）",
  "revenue": {
    "monthly_min": 最低月收入（元）,
    "monthly_max": 最高月收入（元）,
    "breakeven_months": 回本周期（月）
  },
  "startup_cost": {
    "min": 最低启动成本（元）,
    "max": 最高启动成本（元）
  },
  "work_content": ["工作内容1", "工作内容2", ...],
  "success_factors": ["成功关键因素1", "成功关键因素2", ...],
  "risk_assessment": {
    "legal": {
      "level": "低/中/高",
      "description": "法律风险描述",
      "mitigation": ["规避建议1", "规避建议2"]
    },
    "financial": { ... },
    "platform": { ... },
    "competition": { ... }
  },
  "roadmap": [
    {
      "phase": "阶段1名称",
      "duration_days": 天数,
      "tasks": ["任务1", "任务2"]
    },
    ...
  ],
  "success_case": {
    "title": "成功案例标题",
    "background": "案例背景",
    "actions": ["做了什么1", "做了什么2"],
    "results": "结果描述",
    "lessons": ["经验教训1"]
  },
  "failure_case": {
    "title": "失败案例标题",
    "background": "案例背景",
    "mistakes": ["错误1", "错误2"],
    "lessons": ["教训1", "教训2"]
  }
}

重要要求：
1. **禁止推荐**：灰产、传销、诈骗、违规金融项目
2. **风险透明**：必须真实评估风险，不夸大收益
3. **可执行性**：行动路径必须具体可行
4. **本土化**：考虑中国法律法规和平台规则
5. **失败案例**：必须提供真实的失败教训
```

---

## 下一迭代计划 (v1.0 - +1周)

### 新功能
- [ ] 用户登录系统（可选）
  - [ ] OAuth登录（微信/QQ）
  - [ ] 推荐历史持久化到数据库

- [ ] 推荐收藏功能
  - [ ] 收藏按钮
  - [ ] 收藏夹管理

- [ ] 更丰富的反馈机制
  - [ ] 详细反馈表单
  - [ ] 反馈分类和分析

---

## 每日站会记录

### 日期：YYYY-MM-DD
**完成**：
-

**进行中**：
-

**阻塞**：
-

**明天计划**：
-

---

## 里程碑检查点

### Week 1 结束检查点
- [ ] 用户可以填写完整画像表单
- [ ] LLM推荐引擎可以生成完整项目
- [ ] 推荐结果存储到S3
- [ ] 每小时限额控制生效
- [ ] AWS基础设施配置完成（DynamoDB + S3 + Lambda）

### Week 2 结束检查点（MVP上线）
- [ ] 用户可以获得个性化推荐（单个项目）
- [ ] 风险提示模块完整展示
- [ ] 历史推荐功能可用
- [ ] 分享功能可用
- [ ] 后台管理功能可用（配置限额和LLM）
- [ ] 推荐准确率≥60%（10人内测）
- [ ] 首屏加载<2s
- [ ] LLM响应<10s
- [ ] 移动端完美适配
- [ ] 无P0/P1级Bug
