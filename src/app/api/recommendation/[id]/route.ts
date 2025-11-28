import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationById } from '@/lib/aws/s3';
import type { ProjectRecommendation } from '@/lib/types';

// Mock data for development mode when S3 is not configured
const getMockRecommendation = (id: string): ProjectRecommendation => ({
  id,
  userId: 'mock-user',
  title: '私房菜外卖创业',
  summary: '利用烹饪技能开展私房菜外卖业务，低成本启动',
  description: '基于您的烹饪技能和餐饮行业背景，私房菜外卖是一个非常适合的创业方向。您可以从家庭厨房开始，通过微信朋友圈和本地生活平台接单，专注于健康、家常口味的餐食。这个项目启动成本低，可以边做边学，逐步积累客户和口碑。随着订单增加，可以考虑租用小型厨房或升级设备。',
  revenue: {
    monthlyMin: 3000,
    monthlyMax: 15000,
    breakevenMonths: 2,
  },
  startupCost: {
    min: 5000,
    max: 15000,
  },
  workContent: [
    '每日采购新鲜食材（1-2小时）',
    '烹饪和打包餐食（3-4小时）',
    '接单和客户沟通（1小时）',
    '配送或对接配送员（1-2小时）',
    '社交媒体运营和客户维护（1小时）',
  ],
  successFactors: [
    '稳定的出品质量和口味',
    '准时配送和良好的服务态度',
    '持续的客户关系维护',
    '合理的定价策略',
    '食品安全和卫生标准',
  ],
  riskAssessment: {
    legal: {
      level: 'medium',
      description: '家庭厨房经营需要注意食品经营许可证问题，部分地区对家庭厨房有限制。',
      mitigation: [
        '了解当地食品经营法规，必要时办理小餐饮经营许可证',
        '考虑租用符合标准的小型厨房',
        '购买食品安全责任险',
      ],
    },
    financial: {
      level: 'low',
      description: '启动成本较低，主要是食材和包装成本，可以按订单采购降低库存风险。',
      mitigation: [
        '采用预订制，减少食材浪费',
        '控制初期投入，逐步扩大规模',
        '保留3个月运营资金作为缓冲',
      ],
    },
    platform: {
      level: 'medium',
      description: '依赖美团、饿了么等平台可能面临高抽成，平台规则变化风险。',
      mitigation: [
        '建立私域流量，减少平台依赖',
        '多平台运营分散风险',
        '发展微信直接下单渠道',
      ],
    },
    competition: {
      level: 'medium',
      description: '外卖市场竞争激烈，需要找到差异化定位。',
      mitigation: [
        '专注细分市场（如健康餐、月子餐）',
        '打造个人品牌和口碑',
        '提供个性化定制服务',
      ],
    },
  },
  roadmap: [
    {
      phase: '准备阶段',
      durationDays: 14,
      tasks: [
        '确定主打菜品和定价',
        '准备厨房设备和包装材料',
        '了解当地法规，办理必要证照',
        '拍摄菜品照片，准备宣传素材',
      ],
    },
    {
      phase: '试运营阶段',
      durationDays: 30,
      tasks: [
        '朋友圈小范围推广，收集反馈',
        '优化菜品和服务流程',
        '建立稳定的供应链',
        '积累首批种子客户',
      ],
    },
    {
      phase: '正式运营阶段',
      durationDays: 60,
      tasks: [
        '入驻外卖平台，扩大曝光',
        '建立客户微信群，私域运营',
        '推出会员和套餐优惠',
        '根据数据优化菜单和定价',
      ],
    },
    {
      phase: '扩展阶段',
      durationDays: 90,
      tasks: [
        '评估是否需要升级厨房',
        '考虑招聘帮手',
        '开发新菜品和服务',
        '探索团餐等B端业务',
      ],
    },
  ],
  successCase: {
    title: '90后宝妈的私房菜逆袭',
    background: '小李是一位90后全职宝妈，有多年餐饮工作经验。2022年开始在家做私房菜外卖，主打健康家常菜。',
    actions: [
      '从朋友圈5折试吃活动起步',
      '坚持每天发布菜品和制作过程',
      '建立客户群提供订餐提醒',
      '推出周卡月卡增加复购',
    ],
    results: '6个月后月均订单200+，月收入稳定在1.2万以上，还带动了两位邻居一起创业。',
    lessons: ['口碑传播是最好的推广', '稳定的出品比花样多更重要'],
  },
  failureCase: {
    title: '盲目扩张的教训',
    background: '王先生私房菜做得不错，3个月后就租了店面扩大规模，但很快陷入困境。',
    mistakes: [
      '过早租用高成本店面',
      '同时扩展太多菜品线',
      '忽视了老客户维护',
      '低估了店面运营的复杂度',
    ],
    lessons: [
      '稳扎稳打，不要被短期成功冲昏头脑',
      '扩张前做好财务测算和风险评估',
      '保持核心优势，不要盲目多元化',
    ],
  },
  createdAt: new Date().toISOString(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '推荐ID不能为空' },
        { status: 400 }
      );
    }

    // Check if we're in production mode (API_ENDPOINT is set)
    const isProduction = !!process.env.API_ENDPOINT;

    if (isProduction) {
      // Production mode: fetch from S3
      const recommendation = await getRecommendationById(id);

      if (!recommendation) {
        return NextResponse.json(
          { success: false, message: '未找到推荐结果' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        recommendation,
      });
    } else {
      // Development mode: return mock data
      console.log('Development mode: returning mock recommendation for ID:', id);
      const mockRecommendation = getMockRecommendation(id);

      return NextResponse.json({
        success: true,
        recommendation: mockRecommendation,
        isDev: true,
      });
    }
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取推荐失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
