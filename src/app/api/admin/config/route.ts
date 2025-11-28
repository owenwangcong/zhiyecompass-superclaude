import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, isValidSession } from '@/lib/admin/auth';
import { getSystemConfig, updateSystemConfig } from '@/lib/aws/dynamodb';

async function checkAuth(): Promise<boolean> {
  const token = await getAdminSession();
  return !!token && isValidSession(token);
}

export async function GET() {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // Fetch real config from DynamoDB
    const config = await getSystemConfig();

    return NextResponse.json({
      success: true,
      config: {
        hourlyLimit: config.hourlyLimit,
        llmModel: config.llmModel,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Admin Config GET Error]', error);
    return NextResponse.json(
      { success: false, message: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { hourlyLimit, llmModel } = body;

    // Validate hourlyLimit
    if (typeof hourlyLimit === 'number') {
      if (hourlyLimit < 1 || hourlyLimit > 100) {
        return NextResponse.json(
          { success: false, message: '每小时限额必须在1-100之间' },
          { status: 400 }
        );
      }
    }

    // Validate llmModel
    if (llmModel) {
      const validModels = ['claude', 'gpt-4', 'deepseek'];
      if (!validModels.includes(llmModel)) {
        return NextResponse.json(
          { success: false, message: '无效的LLM模型' },
          { status: 400 }
        );
      }
    }

    // Update config in DynamoDB
    const updatedConfig = await updateSystemConfig({
      hourlyLimit,
      llmModel,
    });

    console.log('[Admin Config] Updated:', updatedConfig);

    return NextResponse.json({
      success: true,
      message: '配置已保存',
      config: {
        hourlyLimit: updatedConfig.hourlyLimit,
        llmModel: updatedConfig.llmModel,
        updatedAt: updatedConfig.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Admin Config PUT Error]', error);
    return NextResponse.json(
      { success: false, message: '保存配置失败' },
      { status: 500 }
    );
  }
}
