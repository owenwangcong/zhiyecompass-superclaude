# 智业罗盘 - 任务看板

## 当前迭代: MVP v0.1 (Sprint 1 - 2周)

### Must Have (P0) - 核心功能

#### 1. 项目初始化 (Day 1-2) ✅ **已完成**
- [x] Next.js 14项目搭建
  - [x] 创建项目：`npx create-next-app@latest zhiyecompass`
  - [x] 配置TypeScript严格模式 (tsconfig.json)
  - [x] 配置ESLint + Prettier
- [x] shadcn/ui组件库集成
  - [x] 安装shadcn/ui CLI
  - [x] 配置Tailwind CSS v4
  - [x] 初始化组件库（Button, Card, Form, Input, Label, Select, Radio Group, Checkbox, Textarea）
- [x] 项目结构设计
  - [x] 创建功能目录 (profile, recommendation, history, share, admin)
  - [x] 定义核心类型 (src/lib/types/index.ts)
  - [x] 配置应用常量 (src/lib/constants/index.ts)
  - [x] 实现UUID工具函数 (src/lib/utils/uuid.ts)
- [x] AWS环境配置 (ca-central-1) ✅ **已完成**
  - [x] 创建AWS账号和IAM用户
  - [x] 安装AWS CLI和PowerShell工具
  - [x] 配置AWS CLI凭证 (`aws configure`)
  - [x] 运行自动化脚本: `scripts/aws-setup.ps1`
    - [x] DynamoDB表创建 (单表设计，TTL，备份)
    - [x] S3 Bucket配置 (加密，CORS，生命周期)
    - [x] IAM角色和策略 (Lambda执行角色)
    - [x] Lambda函数创建 (Node.js 20.x，占位符代码)
    - [x] API Gateway配置 (REST API，/recommend端点)
    - [x] 系统配置初始化 (限额10/小时，Claude模型)
  - [x] 验证资源创建
  - [x] 更新 `.env.local` 环境变量

**自动化脚本文件:**
- ✅ `scripts/aws-setup.ps1` - PowerShell一键部署脚本
- ✅ `scripts/aws-cleanup.ps1` - 资源清理脚本
- ✅ `scripts/aws-setup-manual.md` - 详细配置手册（中文）

**预计成本:** ~$55-110/月 (100活跃用户)
- DynamoDB: $1-5/月
- S3: $0.50-2/月
- Lambda: $0.20-1/月 (免费套餐覆盖大部分)
- API Gateway: $0.10-0.50/月
- Claude API: $50-100/月 (主要成本)
- [x] Git仓库设置
  - [x] 初始化Git仓库
  - [x] 配置.gitignore
  - [x] 创建开发分支策略 (feature/project-initialization)

**Commits:**
- c74771b: feat: Complete project initialization with feature structure
- aa4d9d7: feat: Initialize Next.js 14 project with shadcn/ui
- c94a263: Initial commit: Project documentation

#### 2. 用户画像表单页面 (Day 3-4) ✅ **已完成**
- [x] 设计8个核心字段的表单组件
  - [x] 年龄段选择（Select）
  - [x] 地域选择（省份Select + 城市Input + 城市等级Select）
  - [x] 当前状态（Radio Group）
  - [x] 学历（Select）
  - [x] 行业背景（Multi-Select with Checkbox）
  - [x] 技能选择（Multi-Select with Categories）
  - [x] 可用时间（Number Input）
  - [x] 启动资金（Select）
- [x] UUID生成和存储
  - [x] 生成UUID（首次访问）
  - [x] 存储到Session Storage
  - [x] 存储到Cookie（7天有效期）
- [x] 集成React Hook Form + Zod校验
  - [x] 定义Zod Schema (src/lib/validations/profile.ts)
  - [x] 表单校验规则（必填、格式验证）- Zod v4语法
  - [x] 错误提示优化（中文提示）
- [x] 实现单页表单（非分步）
  - [x] 统一页面布局 (src/app/profile/page.tsx)
  - [x] 提交按钮和Loading状态
  - [x] 免责声明提示
- [x] 数据提交到后端
  - [x] API Route: `/api/submit-profile` (POST)
  - [x] 调用Lambda生成推荐
  - [x] 提交后跳转推荐详情页
- [x] 错误处理
  - [x] 限额超限友好提示UI
  - [x] 通用错误提示组件

**新增文件:**
- `src/lib/validations/profile.ts` - Zod v4验证Schema
- `src/app/profile/page.tsx` - 用户画像表单页面
- `src/app/api/submit-profile/route.ts` - 表单提交API
- `src/lib/aws/lambda.ts` - Lambda调用工具
- `src/components/ui/alert.tsx` - Alert组件

**更新文件:**
- `src/lib/constants/index.ts` - 新增行业、技能、省份、城市等级常量

#### 3. LLM推荐引擎Lambda函数 (Day 5-7) ✅ **已完成**
- [x] 实现推荐生成Lambda
  - [x] 接收用户画像JSON
  - [x] **检查每小时限额**（从DynamoDB读取计数）
  - [x] **超限处理**：返回友好错误提示
  - [x] 调用LLM生成完整项目推荐
  - [x] 存储推荐结果到S3 (JSON格式)
  - [x] DynamoDB记录推荐ID和用户UUID关联
  - [x] **限额计数器递增**

- [x] 多LLM支持（可动态切换）
  - [x] OpenAI GPT-4o (API) - 默认
  - [x] Anthropic Claude (API)
  - [x] DeepSeek (API)
  - [x] 从DynamoDB读取当前LLM配置

- [x] Prompt工程
  - [x] 设计项目生成Prompt模板
  - [x] 要求包含：项目描述、收益预期、启动成本、工作内容
  - [x] **风险评估部分**：法律、财务、平台、竞争风险 + 规避建议
  - [x] 行动路径（分阶段里程碑）
  - [x] 成功和失败案例各1个
  - [x] **明确禁止**：灰产、传销、诈骗、违规金融

- [x] 错误处理和降级策略
  - [x] LLM API失败：返回友好错误，建议稍后再试
  - [x] S3存储失败：自动重试
  - [x] 日志记录（CloudWatch）

**新增文件:**
- `lambda/src/index.ts` - Lambda主入口
- `lambda/src/llm.ts` - 多LLM提供商集成
- `lambda/src/types.ts` - 类型定义
- `lambda/package.json` - Lambda依赖配置
- `lambda/tsconfig.json` - TypeScript配置
- `scripts/deploy-lambda.ps1` - Lambda部署脚本
- `scripts/update-lambda-env.ps1` - Lambda环境变量更新脚本

#### 4. 单项目推荐页面 (Day 8-10) ✅ **已完成**
- [x] 推荐详情页 (`/recommendation/:id`)
  - [x] 从URL参数获取推荐ID
  - [x] 从S3加载推荐JSON（开发模式使用Mock数据）
  - [x] Client Component数据获取

- [x] 完整项目信息展示
  - [x] 项目标题和一句话描述
  - [x] 详细项目描述
  - [x] 收益预期（月收入范围、回本周期）
  - [x] 启动成本
  - [x] 日常工作内容
  - [x] 成功关键因素

- [x] **风险提示模块**（重点展示）
  - [x] 法律风险卡片（颜色按风险等级区分）
  - [x] 财务风险卡片
  - [x] 平台风险卡片
  - [x] 竞争风险卡片
  - [x] **风险规避建议**列表（可执行的具体措施）

- [x] 行动路径时间轴组件
  - [x] 阶段性里程碑展示（Step 1/2/3...）
  - [x] 每个阶段的任务列表
  - [x] 预计时间显示（天数）

- [x] 案例展示
  - [x] 成功案例（可折叠）
  - [x] **失败案例**（默认展开，重点展示）
  - [x] 经验教训总结

- [x] 操作按钮
  - [x] "重新生成推荐"按钮（跳转画像页）
  - [x] "分享"按钮（复制链接）
  - [x] "有用/无用"反馈按钮

- [x] 移动端适配
  - [x] 响应式布局
  - [x] 风险卡片堆叠显示

**新增文件:**
- `src/app/recommendation/[id]/page.tsx` - 推荐详情页面（含RiskCard, RoadmapTimeline, CaseStudyCard组件）

#### 5. 历史推荐浏览功能 (Day 11) ✅ **已完成**
- [x] 历史页面 (`/history`)
  - [x] 从Session Storage读取推荐ID列表
  - [x] 如果为空：提示"暂无历史推荐"
  - [x] 批量从API获取推荐内容

- [x] 历史推荐列表
  - [x] 卡片式列表展示（含加载态和错误态）
  - [x] 显示：项目标题、生成时间、简短描述
  - [x] 点击跳转详情页 (`/recommendation/:id`)

- [x] UUID管理
  - [x] 每次生成推荐后，将ID追加到Session Storage列表
  - [x] 清除历史记录功能

- [x] 首页改版
  - [x] 添加导航栏（历史推荐、获取推荐）
  - [x] Hero区域、功能介绍、使用流程
  - [x] 底部免责声明

**新增文件:**
- `src/app/history/page.tsx` - 历史推荐页面
- `src/app/page.tsx` - 首页改版（导航、介绍）

#### 6. 推荐分享功能 (Day 12) ✅ **已完成**
- [x] 分享链接生成
  - [x] 分享按钮点击：复制分享链接
  - [x] 链接格式：`/share/:id`
  - [x] 提示："✓ 已复制链接"（按钮状态变化）

- [x] 分享页面 (`/share/:id`)
  - [x] 公开访问（无需UUID验证）
  - [x] 从API/S3加载推荐内容
  - [x] 与推荐详情页相同的展示
  - [x] 顶部分享Banner提示
  - [x] 底部引导："生成你的专属推荐"（CTA按钮）

- [ ] 分享追踪（P2，可选功能）
  - [ ] 记录分享来源（可选，DynamoDB）
  - [ ] 统计分享次数

**新增文件:**
- `src/app/share/[id]/page.tsx` - 分享页面（含RiskCard, RoadmapTimeline, CaseStudyCard组件）

#### 7. 简单后台管理 (Day 13-14) ✅ **已完成**
- [x] 后台认证
  - [x] 简单的用户名/密码认证（环境变量配置）
  - [x] Session-based认证（Cookie存储，24小时有效期）
  - [x] 登录/登出API (`/api/admin/login`, `/api/admin/logout`)
  - [x] 认证检查API (`/api/admin/check`)

- [x] 系统配置页面 (`/admin`)
  - [x] **每小时推荐限额设置**（Number Input，1-100范围）
  - [x] **LLM模型选择**（Radio Group：Claude/GPT-4/DeepSeek）
  - [x] 配置保存和读取（API: `/api/admin/config`）
  - [x] 配置说明和成本估算展示

- [x] 推荐统计页面 (`/admin/stats`)
  - [x] 累计推荐数
  - [x] 今日推荐数
  - [x] 当前小时已推荐次数 / 限额（进度条可视化）
  - [x] 分享次数统计
  - [x] 平均反馈评分
  - [x] 近7天趋势图（柱状图）
  - [x] 最近活动列表

- [x] 用户反馈查看 (`/admin/feedback`)
  - [x] 反馈列表（评分、理由、评论）
  - [x] 按时间/评分排序
  - [x] 分页支持
  - [x] 评分分布统计

**新增文件:**
- `src/lib/admin/auth.ts` - 管理员认证工具函数
- `src/app/admin/login/page.tsx` - 登录页面
- `src/app/admin/page.tsx` - 系统配置页面
- `src/app/admin/stats/page.tsx` - 数据统计页面
- `src/app/admin/feedback/page.tsx` - 用户反馈页面
- `src/app/admin/layout.tsx` - 后台布局
- `src/app/api/admin/login/route.ts` - 登录API
- `src/app/api/admin/logout/route.ts` - 登出API
- `src/app/api/admin/check/route.ts` - 认证检查API
- `src/app/api/admin/config/route.ts` - 配置管理API
- `src/app/api/admin/stats/route.ts` - 统计数据API
- `src/app/api/admin/feedback/route.ts` - 反馈数据API

**环境变量配置:**
- `ADMIN_USERNAME` - 管理员用户名（默认: admin）
- `ADMIN_PASSWORD` - 管理员密码（必填）

#### 8. 每小时限额控制 (集成到Lambda) ✅ **已完成**
- [x] DynamoDB限额计数器设计
  - [x] 数据结构：`QUOTA#{hour_timestamp}`
  - [x] 存储当前小时的推荐计数
  - [x] TTL自动过期（2小时后清理）

- [x] 限额检查逻辑
  - [x] Lambda开始时检查当前小时计数
  - [x] 如果 `count >= limit`：返回429错误
  - [x] 否则：继续生成推荐并递增计数

- [x] 前端限额提示
  - [x] API返回限额错误时，显示友好Alert提示
  - [x] "本小时推荐额度已用完（X/Y），请下一个小时再试"
  - [x] 显示下一个整点时间

---

### Should Have (P1) - 重要但非阻塞

- [x] 表单记忆功能 (0.5天) ✅ **已完成**
  - [x] 用户提交表单后，保存画像数据到LocalStorage
  - [x] 下次访问画像页面时，自动填充上次输入的数据
  - [x] 提供"清除历史输入"按钮
  - [x] 数据结构：`zhiyecompass_profile_cache`

**新增文件:**
- `src/lib/utils/storage.ts` - LocalStorage工具函数（保存、加载、清除缓存）

**更新文件:**
- `src/app/profile/page.tsx` - 集成表单记忆功能（自动填充、缓存提示、清除按钮）

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
- [x] 用户可以填写完整画像表单
- [x] LLM推荐引擎可以生成完整项目
- [x] 推荐结果存储到S3
- [x] 每小时限额控制生效
- [x] AWS基础设施配置完成（DynamoDB + S3 + Lambda）

### Week 2 结束检查点（MVP上线）
- [x] 用户可以获得个性化推荐（单个项目）
- [x] 风险提示模块完整展示
- [x] 历史推荐功能可用
- [x] 分享功能可用
- [x] 后台管理功能可用（配置限额和LLM）
- [ ] 推荐准确率≥60%（10人内测）
- [ ] 首屏加载<2s
- [ ] LLM响应<10s
- [ ] 移动端完美适配
- [ ] 无P0/P1级Bug
