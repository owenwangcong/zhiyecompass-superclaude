# 智业罗盘（ZhiYeCompass）项目指南

这是一个面向中国用户的AI驱动的副业/创业项目推荐平台。

## 📚 核心文档

在开始工作之前，请先阅读以下文档：

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - 完整的项目策划书（背景、技术架构、开发流程）
- **[PLANNING.md](./PLANNING.md)** - 项目规划（愿景、原则、MVP范围）
- **[TASK.md](./TASK.md)** - 任务看板（当前迭代任务、技术债务）
- **[KNOWLEDGE.md](./KNOWLEDGE.md)** - 知识库（中国副业环境、技术经验、用户洞察）

## 🎯 项目核心

### 产品定位
帮助中国用户找到适合自己的副业/创业项目，通过个性化AI推荐降低试错成本。

### 关键原则
1. **合规优先** - 只推荐合法合规项目，过滤灰产
2. **真实透明** - 展示失败案例，不夸大收益
3. **本土化** - 深度适配中国法律、平台规则
4. **可执行** - 提供具体行动路径和工具清单
5. **风险提示** - 明确告知项目风险和规避建议

## 🛠️ 技术栈

```yaml
前端: Next.js 14 + Tailwind CSS + shadcn/ui
后端: AWS Lambda + API Gateway (ca-central-1)
数据存储:
  - DynamoDB: 用户画像、推荐记录、系统配置
  - S3: LLM生成的项目推荐结果
AI: 可动态切换的LLM (Claude/GPT-4/DeepSeek等)
部署: AWS EC2 (前后端统一部署)
```

## 🏗️ 架构特点

### 无需用户登录
- MVP阶段无需注册/登录功能
- 使用Session Storage + Cookie存储用户标识
- 通过唯一ID追踪用户历史推荐

### LLM动态生成项目
- **无预置项目库**：完全由LLM根据用户画像动态生成
- **结果缓存**：生成的推荐存储在S3，支持浏览历史和分享
- **多LLM支持**：后台可配置使用不同的LLM模型

### 推荐限额控制
- **每小时限额**：防止访问量过大和LLM费用过高
- **后台配置**：运营人员可在后台动态调整限额
- **优雅提示**：额度用完后引导用户下一个小时再试

### 一次一个项目
- 精简体验：每次只推荐一个最匹配的项目
- 深度展示：包含完整的项目描述、风险评估、行动路径
- 重新生成：用户可选择重新生成另一个推荐

## 🚀 快速开始

### 使用 SuperClaude 框架开发

```bash
# 1. 加载项目上下文
/sc:load zhiyecompass

# 2. 查看当前任务
/sc:pm review TASK.md

# 3. 开始开发前的调研
/sc:research "你要研究的主题"

# 4. 实现功能
/sc:implement "功能描述"

# 5. 生成测试
/sc:test "测试场景"

# 6. 代码分析
/sc:analyze --focus security,quality

# 7. 保存会话
/sc:save "里程碑描述"
```

### 本地开发环境

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# E2E测试
npm run test:e2e
```

## 📋 当前状态

**当前迭代**: MVP v0.1 (2周冲刺)

**核心目标**:
- [ ] 用户画像表单（8个核心字段）
- [ ] LLM推荐引擎Lambda函数（ca-central-1）
- [ ] 单项目推荐页（含风险提示）
- [ ] 历史推荐浏览功能
- [ ] 推荐分享功能
- [ ] 简单后台管理（限额配置、LLM切换）

**验收标准**:
- 推荐准确率 ≥60%
- LLM响应时间 <10s（由于生成项目内容丰富，可接受较长时间）
- 首屏加载 <2s
- 移动端完美适配

详细任务清单见 [TASK.md](./TASK.md)

## ⚠️ 重要注意事项

### 合规性
- ❌ **禁止推荐**: 灰产、传销、诈骗、违规金融项目
- ✅ **必须包含**: 法律风险评估、失败案例、免责声明
- ✅ **风险提示**: 明确告知用户需要注意的风险点和规避建议

### 中国本土化
- 考虑微信/支付宝等平台规则
- 遵守中国个人所得税申报要求
- 适配中国用户的决策心理（更信任失败案例和风险提示）

### LLM成本控制
- **每小时限额**: 后台可配置，默认建议10-20次/小时
- **结果缓存**: 相同画像24h内复用S3缓存结果
- **降级方案**: LLM失败时提供友好错误提示

### 历史推荐管理
- **用户标识**: 使用UUID存储在Session Storage和Cookie
- **推荐ID**: 每次推荐生成唯一ID，存储推荐ID列表
- **后台调用**: 通过推荐ID从S3获取历史推荐内容

### 分享功能
- **分享链接**: 生成包含推荐ID的分享URL
- **公开访问**: 任何人通过链接可查看推荐内容
- **传播追踪**: 记录分享来源，便于分析传播效果

详细说明见 [KNOWLEDGE.md](./KNOWLEDGE.md)

## 🔄 开发工作流

### 标准迭代流程

```bash
# 迭代启动
/sc:load zhiyecompass
/sc:brainstorm "本次迭代目标"
/sc:pm update TASK.md

# 开发阶段
/sc:research "技术调研"
/sc:implement "功能实现"
/sc:test "测试生成"

# 迭代结束
/sc:analyze --all
/sc:document "文档生成"
/sc:git commit "规范提交"
/sc:save "会话保存"
```

### 遇到问题时

```bash
# 技术难题
/sc:research "具体问题"
/sc:sequential "系统性分析（使用Sequential MCP）"

# 踩坑后
/sc:reflect "记录到KNOWLEDGE.md"

# 需要商业分析
/sc:business-panel "分析主题" --experts "相关专家"
```

## 📊 项目指标

**产品指标** (MVP目标):
- 推荐准确率: >60%
- 用户留存率: Day 7 >30%
- 分享率: >15%

**技术指标**:
- 首屏加载: <2s
- LLM响应: <10s (可接受)
- API成功率: >99%
- LLM成本: <$100/月（前100用户）

## 🔗 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com)
- [AWS Lambda 文档](https://docs.aws.amazon.com/lambda)
- [Claude API 文档](https://docs.anthropic.com)

## 💡 最后建议

1. **先做减法再做加法** - MVP只做核心流程
2. **真实数据驱动** - 尽早找10个真实用户测试
3. **合规是红线** - 宁可项目少，不碰灰产边缘
4. **持续学习** - 用KNOWLEDGE.md沉淀经验
5. **拥抱SuperClaude** - 熟练使用/sc:*命令，效率提升3-5倍

---

有任何问题，使用 `/sc:brainstorm` 与我讨论！🚀
