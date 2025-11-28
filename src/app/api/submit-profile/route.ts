import { NextRequest, NextResponse } from 'next/server';
import { profileFormSchema } from '@/lib/validations/profile';
import { generateUUID } from '@/lib/utils/uuid';
import { invokeRecommendationLambda } from '@/lib/aws/lambda';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body, null, 2));

    const { uuid, profile } = body;

    if (!uuid) {
      return NextResponse.json(
        { success: false, message: '缺少用户标识' },
        { status: 400 }
      );
    }

    console.log('Profile to validate:', JSON.stringify(profile, null, 2));

    // Validate profile data
    const validatedProfile = profileFormSchema.safeParse(profile);
    console.log('Validation result:', validatedProfile.success, validatedProfile.error?.issues);
    if (!validatedProfile.success) {
      return NextResponse.json(
        {
          success: false,
          message: '表单数据验证失败',
          errors: validatedProfile.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    // Generate recommendation ID
    console.log('Generating recommendation ID...');
    const recommendationId = generateUUID();
    console.log('Generated recommendationId:', recommendationId);

    // Check if API_ENDPOINT is configured (Lambda is deployed)
    const apiEndpoint = process.env.API_ENDPOINT;
    console.log('API_ENDPOINT:', apiEndpoint || 'not set');

    if (!apiEndpoint) {
      // Development mode: return mock response
      console.log('API_ENDPOINT not configured, using mock response');

      const response = {
        success: true,
        recommendationId,
        title: '内容创作副业',
        summary: '利用写作技能进行自媒体内容创作',
        message: '推荐生成成功（开发模式）',
        isDev: true,
      };
      console.log('Returning mock response:', response);
      return NextResponse.json(response);
    }

    // Production mode: Call Lambda via API Gateway
    const lambdaResult = await invokeRecommendationLambda({
      uuid,
      profile: validatedProfile.data,
      recommendationId,
    });

    if (!lambdaResult.success) {
      // Handle quota exceeded
      if (lambdaResult.currentCount !== undefined && lambdaResult.limit !== undefined) {
        return NextResponse.json({
          success: false,
          message: lambdaResult.message,
          quotaExceeded: true,
          currentCount: lambdaResult.currentCount,
          limit: lambdaResult.limit,
          nextResetTime: lambdaResult.nextResetTime,
        }, { status: 429 });
      }

      // Handle other errors
      return NextResponse.json({
        success: false,
        message: lambdaResult.message || '推荐生成失败，请稍后重试',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      recommendationId: lambdaResult.recommendationId,
      title: lambdaResult.title,
      summary: lambdaResult.summary,
      quotaRemaining: lambdaResult.quotaRemaining,
      message: '推荐生成成功',
    });

  } catch (error) {
    console.error('Submit profile error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
