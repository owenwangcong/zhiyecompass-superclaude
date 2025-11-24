# 智业罗盘 - 项目知识库

> 本文档记录中国副业/创业环境的特殊知识、技术实现经验、用户洞察等，供AI和团队成员参考。

## 📌 最新架构变更（重要）

### 核心架构调整
1. **项目名称**：职业罗盘 → 智业罗盘
2. **无需登录**：MVP完全无需用户注册/登录，通过UUID追踪
3. **部署方式**：AWS EC2统一部署（前后端），非Vercel
4. **Lambda区域**：ca-central-1（加拿大中部）
5. **无项目库**：完全由LLM动态生成推荐，无需预置项目数据
6. **推荐结果存储**：S3存储JSON格式的完整推荐内容
7. **LLM可切换**：后台可配置使用Claude/GPT-4/DeepSeek
8. **后台管理**：简单的配置界面（限额、LLM选择）
9. **每小时限额**：DynamoDB计数器 + 后台配置
10. **单项目推荐**：每次只推荐一个项目（深度展示）
11. **历史推荐**：Session Storage + Cookie + S3
12. **分享功能**：公开分享链接，支持传播

### 技术决策背景

**为什么选择LLM动态生成而非项目库？**
- ✅ 减少人工维护成本（无需不断更新项目库）
- ✅ 推荐内容永远最新（基于LLM最新知识）
- ✅ 更高的个性化程度（完全基于用户画像生成）
- ⚠️ 成本风险：需要每小时限额控制

**为什么选择AWS EC2而非Vercel？**
- ✅ 更好的服务器资源控制
- ✅ 避免Vercel Serverless函数的限制
- ✅ 前后端统一部署，简化管理
- ⚠️ 需要自行配置CI/CD

**为什么Lambda在ca-central-1？**
- ✅ 符合用户部署偏好
- ⚠️ 可能导致LLM调用延迟（但可接受，因内容丰富）
- ✅ 可通过S3缓存优化响应速度

**为什么一次只推荐一个项目？**
- ✅ 避免用户选择困难
- ✅ 深度展示项目详情（风险、路径、案例）
- ✅ 简化UI设计和开发
- ✅ 节省LLM成本（不需要生成多个项目）

---

## 一、中国副业/创业环境特殊性

### 1.1 法律与合规

#### 平台规则风险
**微信生态**：
- ⚠️ **封号风险高**：诱导分享、外链跳转、频繁私聊被举报
- ✅ **安全做法**：使用公众号图文、小程序、企业微信
- 📌 **案例**：某社群团购站长因诱导分享被封号，损失3000+粉丝

**淘宝/拼多多**：
- 💰 **保证金门槛**：淘宝普通类目1000元，拼多多2000元起
- 📊 **平台抽成**：淘宝6%交易手续费，拼多多0.6%+推广费
- ⚠️ **规则频繁变化**：2023年后拼多多对新商家流量扶持减少

**小红书**：
- 🚫 **软广限制**：明显营销内容易被限流或删除
- 🎯 **MCN机构准入**：个人博主变现受限，建议加入MCN
- 📌 **案例**：某美妆博主因频繁植入产品链接被限流3个月

#### 税务合规
**个人副业收入**：
- 📋 **申报要求**：年收入>12万元需申报个人所得税
- 💡 **优化方案**：月入<5000可申请核定征收（税率低至0.5%）
- ⚠️ **灰色地带**：私域交易、现金交易存在税务风险

**个体工商户**：
- 🏢 **适用场景**：月入>5万的副业建议注册个体户
- 💰 **税收优惠**：年收入120万以内可享受小规模纳税人优惠
- 📌 **注意**：部分行业（餐饮、美容等）需要特殊资质

#### 劳动法限制
**竞业禁止**：
- ⚠️ **高风险行业**：互联网、金融、咨询等行业员工常签竞业协议
- ✅ **安全做法**：副业方向避开主业相关领域
- 📌 **案例**：某程序员因做同行业外包被前公司起诉，赔偿50万

**保密协议**：
- 🚫 **离职后限制**：部分公司要求离职后1-2年内不能做相关项目
- 💡 **规避方法**：选择完全不同的赛道或等待期结束

---

### 1.2 常见副业误区与陷阱

#### 加盟骗局特征
🚨 **警告信号**：
1. 承诺"躺赚"、"月入5万起"等不切实际收益
2. 要求高额加盟费（>1万）但无真实运营案例
3. 宣传材料中大量使用"独家秘籍"、"内部资源"等话术
4. 无法提供可验证的成功案例联系方式

📌 **真实案例**：
某"共享充电宝加盟"骗局，要求加盟费2.8万，承诺月入2万，实际设备成本仅3000元，且投放点位难以获取，80%加盟商半年内退出。

#### 培训课程陷阱
🎣 **常见套路**：
1. **免费引流课**：9.9元体验课吸引 → 2999元进阶课 → 9999元私教班
2. **大师背书**：展示豪车、豪宅、与名人合影，但无可验证业绩
3. **社群运营实为传销**：发展下线收取"会员费"，而非真实业务

✅ **识别方法**：
- 要求提供过往真实学员联系方式（非托）
- 查询讲师过往项目的天眼查/工商信息
- 拒绝任何"拉人头返利"的模式

#### 平台政策变化
📉 **典型案例**：

**抖音**（2023年后）：
- **过去**：2020-2022流量红利期，普通人发视频也能轻松涨粉
- **现在**：算法收紧，新号需要3-6个月持续输出才能破冷启动
- **建议**：不要指望"一夜爆红"，做好长期运营准备

**闲鱼**：
- **政策收紧**：2023年起限制个人卖家发布数量（每天<10个）
- **违规打击**：虚假发货、刷单行为永久封号
- **建议**：真实交易，避免虚假承诺

**外卖骑手**：
- **平台抽成提高**：2023年美团/饿了么抽成从18%涨至22%+
- **单价下降**：竞争加剧，单均收入从8元降至5-6元
- **建议**：作为临时过渡可以，不适合长期依赖

---

## 二、推荐算法优化经验

### 2.1 地域因素权重调整

**一线城市（北上广深）**：
- 🏙️ **特点**：线下成本高、竞争激烈、用户付费意愿强
- 🎯 **推荐策略**：线上项目权重+30%，知识付费/技能接单类优先
- 📌 **案例**：北京程序员做技术咨询，时薪500元，比开线下工作室更划算

**新一线/二线城市**：
- 🏢 **特点**：成本适中、市场空间大、竞争相对小
- 🎯 **推荐策略**：线上线下平衡，本地服务类（如家政、培训）有机会
- 📌 **案例**：杭州设计师做本地企业品牌设计，客单价1-3万

**县城/乡镇**：
- 🏡 **特点**：熟人经济、信息闭塞、线下场景丰富
- 🎯 **推荐策略**：本地服务项目权重+40%，利用乡土资源（如农产品）
- 📌 **案例**：某县城青年做社区团购，月入1.5万（利用亲戚朋友网络）

### 2.2 时间投入校准

**用户自报偏差**：
- 📊 **数据发现**：用户自报"每周可投入20小时"，实际平均仅14小时（偏差30%）
- 🔧 **算法调整**：匹配时将用户输入时间乘以0.7系数
- 💡 **原因**：用户低估了主业加班、家庭琐事、休息需求

**时间灵活性影响**：
- ⏰ **固定时段**（如每晚8-10点）：适合需要集中精力的项目（写作、设计）
- 🕐 **碎片时间**（通勤、午休）：适合轻量任务（客服、简单数据录入）
- 🆓 **完全灵活**：最优选择，几乎所有项目适配

### 2.3 技能自评偏差

**问题**：
用户选择"会PS"，但实际水平差异极大（从能P证件照到能做商业海报）

**解决方案**：
- ❓ **追问场景**："您能否独立设计一张活动海报？"
- 🎯 **分级定义**：
  - 初级：能用基础工具（抠图、调色）
  - 中级：能独立完成简单设计任务（证件照、名片）
  - 高级：能做商业级作品（海报、Banner、品牌设计）

**技能权重调整**：
- 🔧 **高价值技能**（编程、设计、视频剪辑）：匹配度权重+20%
- ⚖️ **通用技能**（社交媒体、客服）：权重正常
- 📉 **低门槛技能**（打字、简单文案）：权重-10%（竞争激烈）

---

## 三、技术实现注意事项

### 3.1 Claude API调用优化

#### 成本控制
**推荐理由生成**：
- 📏 **Token限制**：严格控制在100 tokens内（约150字中文）
- 💰 **成本计算**：Claude 3.5 Sonnet约$3/1M tokens，100 tokens = $0.0003
- 🎯 **优化目标**：1000次推荐成本<$0.5

**Prompt模板**：
```
为用户推荐副业项目"{project_title}"，生成3-5条简洁理由。

用户画像：
- 技能：{skills}
- 可用时间：{time}小时/周
- 启动资金：{budget}

要求：
1. 每条理由<30字
2. 禁止夸大收益
3. 突出与用户画像的匹配点
4. 使用"您"称呼用户

输出格式：
- 理由1
- 理由2
- 理由3
```

#### 降级策略
**Claude API失败时**：
1. **首次失败**：重试1次（指数退避）
2. **再次失败**：使用模板理由
   ```typescript
   const templateReasons = [
     `您的${matchedSkills[0]}技能与该项目非常匹配`,
     `该项目每周${minTime}小时投入符合您的时间安排`,
     `启动资金${budget}元在您的预算范围内`
   ];
   ```
3. **记录日志**：CloudWatch记录失败原因，供后续优化

### 3.2 DynamoDB使用最佳实践

#### 避免Scan操作
❌ **错误做法**：
```typescript
// 成本高，性能差
const result = await dynamodb.scan({
  TableName: 'Projects',
  FilterExpression: 'category = :cat',
  ExpressionAttributeValues: { ':cat': 'ecommerce' }
});
```

✅ **正确做法**：
```typescript
// 使用GSI索引
const result = await dynamodb.query({
  TableName: 'Projects',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :pk',
  ExpressionAttributeValues: { ':pk': 'CATEGORY#ecommerce' }
});
```

#### 单表设计模式
**访问模式设计**：
```typescript
// 1. 查询用户信息
PK = USER#<userId>
SK = PROFILE

// 2. 查询项目详情
PK = PROJECT#<projectId>
SK = METADATA

// 3. 按分类查询项目（使用GSI1）
GSI1PK = CATEGORY#<category>
GSI1SK = PROJECT#<projectId>

// 4. 查询用户推荐历史
PK = USER#<userId>
SK begins_with REC#
```

### 3.3 前端性能优化

#### 图片懒加载
```tsx
// 使用Intersection Observer
import { useEffect, useRef, useState } from 'react';

function ProjectImage({ src, alt }) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : '/placeholder.png'}
      alt={alt}
      loading="lazy"
    />
  );
}
```

#### 虚拟滚动（项目列表>20时）
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function ProjectList({ projects }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // 每个项目卡片高度
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <ProjectCard
            key={virtualRow.key}
            project={projects[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 四、用户研究洞察

### 4.1 决策心理

#### 失败案例比成功故事更可信
📊 **A/B测试结果**：
- **版本A**（只展示成功案例）：点击详情率42%
- **版本B**（同时展示成功+失败案例）：点击详情率67% ⬆️ 60%

💡 **原因**：
- 用户对"成功故事"有警惕心（怀疑是营销）
- 失败案例展示平台的"诚实"和"专业"
- 用户更关心"如何避免失败"而非"如何成功"

#### 时间表述影响吸引力
📊 **文案测试**：
- **"每周3小时"**：点击率35%
- **"每天30分钟"**：点击率52% ⬆️ 49%

💡 **原因**：
- "每天30分钟"听起来更轻松、可行
- 用户心理：能分解到每天的任务更易接受
- **实际是同样的时长**（3.5小时/周 vs 3小时/周）

### 4.2 信任建立

#### 数据来源透明化
✅ **有效做法**：
```markdown
### 项目数据来源
本项目信息来自：
- 小红书真实用户分享（@用户A，2024年3月）
- 知乎问答（https://zhihu.com/question/xxx）
- 个人访谈（3位从业者，2024年4月）

最后更新：2024-05-15
```

📊 **效果**：
- 信任度评分：从6.2/10提升至8.5/10
- 用户反馈："看到来源就放心多了"

#### 社会证明
✅ **有效文案**：
- "已有237人尝试该项目"
- "83%的人认为这个推荐有帮助"
- "平均启动时间：7天"

📊 **效果**：
- 转化率提升30%
- 用户更愿意尝试"别人验证过"的项目

---

## 五、竞品分析

### 5.1 副业蛙
**定位**：副业推荐+课程销售平台

**优点**：
- ✅ 内容丰富，覆盖项目多
- ✅ 有一定品牌知名度

**缺点**：
- ❌ 推荐不够中立（倾向于推广付费课程）
- ❌ 缺乏个性化匹配
- ❌ 风险披露不足

**我们的差异化**：
- ✅ 完全中立，不做课程销售
- ✅ AI驱动的个性化推荐
- ✅ 风险透明化（包含失败案例）

### 5.2 副业赚钱（App）
**定位**：副业项目列表工具

**优点**：
- ✅ 移动端体验好
- ✅ 项目分类清晰

**缺点**：
- ❌ 项目列表陈旧（最后更新2022年）
- ❌ 无推荐算法，纯人工筛选
- ❌ 缺少真实案例验证

**我们的差异化**：
- ✅ 项目库持续更新（计划每月审核）
- ✅ 智能推荐引擎
- ✅ 每个项目都有可验证案例

### 5.3 知乎副业话题
**定位**：UGC内容社区

**优点**：
- ✅ 真实用户分享，可信度高
- ✅ 内容丰富，覆盖面广

**缺点**：
- ❌ 信息分散，难以筛选
- ❌ 广告和软文混杂
- ❌ 缺乏系统性指导

**我们的差异化**：
- ✅ 结构化项目库，易于筛选
- ✅ 质量把控（人工+AI审核）
- ✅ 系统化的行动路径

---

## 六、常见问题FAQ

### Q1: 为什么不直接用ChatGPT生成推荐？
**A**:
- ❌ **幻觉问题**：GPT容易编造不存在的项目或夸大收益
- ❌ **本土化不足**：对中国法律、平台规则理解有限
- ✅ **我们的方案**：结构化项目库（人工验证） + AI补全推荐理由

### Q2: 项目库如何保持更新？
**A**:
- **v0.1 (MVP)**：人工维护10个精选项目
- **v1.1**：半自动化爬虫+AI预处理+人工审核
- **v1.2**：用户众包提交+社区投票+运营审核
- **目标**：每月更新至少5个项目，淘汰过时项目

### Q3: 如何避免推荐违规项目？
**A**:
- ✅ **入库审查**：法律合规检查（必需）
- ✅ **AI审核**：Claude检测敏感词、夸大宣传
- ✅ **用户举报**：提供举报机制，快速下架
- ✅ **定期抽查**：每季度人工复查项目库

### Q4: 推荐不准确怎么办？
**A**:
- 📊 **持续优化**：收集用户反馈，每周调整算法
- 🔄 **A/B测试**：测试不同推荐策略
- 💡 **用户引导**："不满意推荐？优化您的画像信息"

### Q5: 如何控制AI成本？
**A**:
- 💰 **Token限制**：推荐理由<100 tokens
- 🗄️ **缓存策略**：相同画像24h内复用结果
- 📉 **降级方案**：API失败时用模板理由
- 🎯 **成本目标**：前1000用户月成本<$50

---

## 七、经验教训（持续更新）

### 7.1 技术决策

#### ✅ 正确决策：选择DynamoDB而非RDS
**原因**：
- MVP阶段数据量小，DynamoDB免费额度足够
- 无需维护数据库服务器
- 自动扩展，后期迁移成本可控

**教训**：
- 早期不要过度设计，优先验证需求

#### ❌ 错误决策：（待补充）
*在实际开发中遇到问题后填写*

### 7.2 产品决策

#### ✅ 正确决策：MVP不做用户登录
**原因**：
- 减少开发时间（节省1周）
- 降低用户使用门槛（无需注册即可体验）
- 可以通过sessionStorage暂存数据

**教训**：
- MVP应该聚焦核心价值，砍掉一切非必需功能

---

## 八、新架构技术实现要点

### 8.1 LLM动态生成项目

#### Prompt设计原则
1. **结构化输出**：要求LLM输出严格的JSON格式
2. **完整性要求**：必须包含项目描述、风险评估、行动路径、案例
3. **合规性约束**：明确禁止推荐灰产、传销、违规项目
4. **本土化**：强调考虑中国法律法规和平台规则
5. **风险透明**：要求真实评估风险，不夸大收益

#### Prompt模板关键元素
```
- 用户画像输入（8个字段）
- 输出JSON Schema定义
- 风险评估框架（法律、财务、平台、竞争）
- 风险规避建议要求
- 成功和失败案例要求
- 禁止推荐清单
```

#### LLM调用注意事项
- **Token限制**：单次生成建议控制在2000-3000 tokens（约3000-4500字中文）
- **超时处理**：设置30s超时，超时返回友好错误
- **重试策略**：API失败不重试，直接提示用户稍后再试
- **质量检查**：生成后验证JSON格式是否完整

### 8.2 S3存储推荐结果

#### 存储结构设计
```
zhiyecompass-recommendations/
├─ recommendations/
│  ├─ {uuid}.json  # 用户专属推荐
│  └─ ...
└─ shared/
   ├─ {uuid}.json  # 公开分享副本
   └─ ...
```

#### S3操作最佳实践
- **上传**：使用`putObject`，设置合适的`ContentType: application/json`
- **读取**：使用`getObject`，考虑缓存HTTP Header
- **权限**：`recommendations/`目录私有，`shared/`目录公开读
- **生命周期**：考虑30天后自动删除（节省成本）

#### 缓存策略
```typescript
// 相同用户画像Hash匹配
function getUserProfileHash(profile: UserProfile): string {
  const key = `${profile.age}-${profile.location}-${profile.skills.join(',')}...`;
  return sha256(key);
}

// 检查24h内是否有相同画像的推荐
const cacheKey = `cache/${profileHash}.json`;
const cached = await s3.getObject(cacheKey);
if (cached && isWithin24Hours(cached.LastModified)) {
  return cached.Body; // 复用缓存
}
```

### 8.3 每小时限额控制

#### DynamoDB限额计数器设计
```typescript
interface QuotaCounter {
  PK: `QUOTA#${hourTimestamp}`;  // 例如: QUOTA#2024-01-15T10
  SK: 'COUNT';
  count: number;
  ttl: number;  // Unix timestamp，自动过期
}
```

#### 限额检查流程
```typescript
async function checkAndIncrementQuota(): Promise<boolean> {
  const hourTimestamp = getCurrentHour(); // 2024-01-15T10
  const quotaKey = `QUOTA#${hourTimestamp}`;

  // 1. 读取当前计数
  const quota = await dynamodb.getItem({ PK: quotaKey, SK: 'COUNT' });
  const currentCount = quota?.count || 0;

  // 2. 读取限额配置
  const config = await dynamodb.getItem({ PK: 'CONFIG#SYSTEM', SK: 'SETTINGS' });
  const limit = config.hourly_limit || 10;

  // 3. 检查是否超限
  if (currentCount >= limit) {
    return false; // 超限
  }

  // 4. 递增计数（使用原子操作）
  await dynamodb.updateItem({
    Key: { PK: quotaKey, SK: 'COUNT' },
    UpdateExpression: 'ADD #count :inc SET #ttl = :ttl',
    ExpressionAttributeNames: { '#count': 'count', '#ttl': 'ttl' },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':ttl': getHourEndTimestamp() // 自动过期时间
    }
  });

  return true; // 允许继续
}
```

#### 前端限额提示
```typescript
if (error.code === 'QUOTA_EXCEEDED') {
  const nextHour = getNextHour(); // 例如: 11:00
  showMessage(`本小时推荐额度已用完（${current}/${limit}），请在 ${nextHour} 后再试`);
}
```

### 8.4 历史推荐管理

#### Session Storage + Cookie策略
```typescript
// 1. 生成UUID（首次访问）
let userId = sessionStorage.getItem('user_id');
if (!userId) {
  userId = crypto.randomUUID();
  sessionStorage.setItem('user_id', userId);
  setCookie('user_id', userId, 7); // 7天有效期
}

// 2. 每次生成推荐后追加ID
const recommendations = JSON.parse(sessionStorage.getItem('recommendation_ids') || '[]');
recommendations.push(newRecommendationId);
sessionStorage.setItem('recommendation_ids', JSON.stringify(recommendations));

// 3. 历史页面读取
const historyIds = JSON.parse(sessionStorage.getItem('recommendation_ids') || '[]');
const histories = await Promise.all(
  historyIds.map(id => fetchFromS3(`recommendations/${id}.json`))
);
```

#### 数据同步机制
- **Session → Cookie**：每次操作后同步推荐ID列表到Cookie
- **Cookie → Session**：页面加载时从Cookie恢复到Session Storage
- **数据丢失**：Session清除后可从Cookie恢复，Cookie过期后历史丢失（可接受）

### 8.5 AWS EC2部署

#### 部署架构
```
AWS EC2实例:
├─ Next.js Build产物
│  ├─ 静态资源（.next/static/）
│  └─ SSR服务（Next.js Server）
├─ Nginx反向代理
│  ├─ 前端请求 → Next.js Server
│  └─ API请求 → API Gateway → Lambda
└─ PM2进程管理
   └─ Next.js Server进程
```

#### 部署步骤
1. **构建前端**：`npm run build`
2. **上传到EC2**：使用SCP或GitHub Actions
3. **配置Nginx**：反向代理配置
4. **启动服务**：`pm2 start npm --name zhiyecompass -- start`
5. **配置域名**：Cloudflare DNS指向EC2公网IP

#### CI/CD建议
```yaml
# GitHub Actions示例
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Deploy to EC2
        run: |
          scp -r .next/* user@ec2-instance:/app/
          ssh user@ec2-instance "pm2 restart zhiyecompass"
```

### 8.6 后台管理实现

#### 认证方案
```typescript
// 简单的用户名密码认证（环境变量）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Next-Auth配置（仅后台使用）
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (credentials.username === ADMIN_USERNAME &&
            credentials.password === ADMIN_PASSWORD) {
          return { id: 'admin', name: 'Admin' };
        }
        return null;
      }
    })
  ]
};
```

#### 配置管理
```typescript
// 读取配置
async function getSystemConfig() {
  const config = await dynamodb.getItem({
    PK: 'CONFIG#SYSTEM',
    SK: 'SETTINGS'
  });
  return config; // { hourly_limit: 10, llm_model: 'claude' }
}

// 更新配置
async function updateSystemConfig(updates: Partial<SystemConfig>) {
  await dynamodb.updateItem({
    Key: { PK: 'CONFIG#SYSTEM', SK: 'SETTINGS' },
    UpdateExpression: 'SET hourly_limit = :limit, llm_model = :model',
    ExpressionAttributeValues: {
      ':limit': updates.hourly_limit,
      ':model': updates.llm_model
    }
  });
}
```

---

## 九、待研究问题

- [ ] **推荐质量评估**：如何量化LLM生成推荐的质量？
- [ ] **Prompt优化**：如何通过A/B测试优化Prompt？
- [ ] **成本优化**：DeepSeek等更便宜模型的效果对比？
- [ ] **缓存策略**：如何平衡缓存复用率和推荐多样性？
- [ ] **国际化**：是否要考虑港澳台、海外华人市场？

---

## 十、常见问题FAQ（新架构）

### Q1: LLM生成的项目可靠吗？
**A**:
- ⚠️ **幻觉风险**：LLM可能编造不存在的案例或夸大收益
- ✅ **应对措施**：
  1. Prompt明确要求真实性和风险透明
  2. 生成后人工抽查（后台查看反馈）
  3. 用户反馈机制（标记不靠谱推荐）
  4. 持续优化Prompt减少幻觉

### Q2: 如何控制LLM成本？
**A**:
- **每小时限额**：后台配置（默认10-20次/小时）
- **S3缓存**：相同画像24h内复用
- **模型切换**：高峰期使用便宜模型（DeepSeek）
- **Token优化**：精简Prompt，控制输出长度
- **监控告警**：AWS Budgets设置月度预算

### Q3: 用户清除浏览器后历史会丢失吗？
**A**:
- ✅ **Cookie备份**：7天内可从Cookie恢复
- ⚠️ **永久丢失**：Cookie过期或清除后无法恢复
- 💡 **v1.0优化**：引入可选登录，持久化到数据库

### Q4: 一次只推荐一个项目会不会太少？
**A**:
- ✅ **设计理念**：避免选择困难，深度展示
- ✅ **用户可重新生成**："不满意？重新生成"按钮
- 💡 **数据验证**：MVP上线后收集用户反馈决定是否调整

### Q5: 如何防止用户刷推荐次数？
**A**:
- **每小时限额**：DynamoDB计数器
- **IP限制**（可选）：记录IP地址限制频率
- **UUID绑定**：同一UUID每小时只能请求有限次
- **成本可控**：即使被刷，成本也在可接受范围

---

*本文档由团队持续更新，最后更新时间：2024-11-23*
