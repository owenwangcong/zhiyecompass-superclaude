'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SkeletonRecommendation } from '@/components/ui/skeleton';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { SharePanel, ShareModal, FloatingShareButton } from '@/components/share/SharePanel';
import type { ProjectRecommendation } from '@/lib/types';

function RiskCard({
  title,
  risk,
  icon
}: {
  title: string;
  risk: { level: string; description: string; mitigation: string[] };
  icon: string;
}) {
  const levelColors = {
    low: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    medium: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    high: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  };

  const levelText = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };

  const levelBadgeColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const level = risk.level as 'low' | 'medium' | 'high';

  return (
    <Card className={`p-4 border-2 ${levelColors[level]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold flex items-center gap-2">
          <span>{icon}</span> {title}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full ${levelBadgeColors[level]}`}>
          {levelText[level]}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
        {risk.description}
      </p>
      <div>
        <p className="text-sm font-medium mb-1">规避建议：</p>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          {risk.mitigation.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function RoadmapTimeline({ roadmap }: { roadmap: ProjectRecommendation['roadmap'] }) {
  return (
    <div className="space-y-4">
      {roadmap.map((phase, idx) => (
        <div key={idx} className="relative pl-8 pb-4">
          {/* Timeline line */}
          {idx < roadmap.length - 1 && (
            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
          )}
          {/* Timeline dot */}
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
            {idx + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{phase.phase}</h4>
              <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                {phase.durationDays}天
              </span>
            </div>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              {phase.tasks.map((task, taskIdx) => (
                <li key={taskIdx} className="flex items-start gap-2">
                  <span className="text-zinc-400">•</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaseStudyCard({
  caseStudy,
  type
}: {
  caseStudy: ProjectRecommendation['successCase'] | ProjectRecommendation['failureCase'];
  type: 'success' | 'failure';
}) {
  const [isExpanded, setIsExpanded] = useState(type === 'failure');
  const isSuccess = type === 'success';

  return (
    <Card className={`p-4 border-2 ${
      isSuccess
        ? 'border-green-200 dark:border-green-800'
        : 'border-orange-200 dark:border-orange-800'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <span>{isSuccess ? '✅' : '⚠️'}</span>
            {isSuccess ? '成功案例' : '失败教训'}：{caseStudy.title}
          </h4>
          <span className="text-zinc-400">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-sm font-medium">背景：</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {caseStudy.background}
            </p>
          </div>

          {'actions' in caseStudy && caseStudy.actions && (
            <div>
              <p className="text-sm font-medium">做对了什么：</p>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                {caseStudy.actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {'mistakes' in caseStudy && caseStudy.mistakes && (
            <div>
              <p className="text-sm font-medium">犯了什么错：</p>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                {caseStudy.mistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {'results' in caseStudy && caseStudy.results && (
            <div>
              <p className="text-sm font-medium">结果：</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {caseStudy.results}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">经验教训：</p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              {caseStudy.lessons.map((lesson, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500">💡</span>
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function RecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<ProjectRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // 二维码显示当前推荐页面的URL，用户扫码后可直接查看
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/recommendation/${params.id}`
    : '';

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/recommendation/${params.id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || '获取推荐失败');
        }

        setRecommendation(data.recommendation);
      } catch (err) {
        console.error('Failed to fetch recommendation:', err);
        setError(err instanceof Error ? err.message : '获取推荐失败');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecommendation();
    }
  }, [params.id]);

  const handleRegenerate = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
            <span className="skeleton h-4 w-16 rounded" />
            <span>•</span>
            <span className="skeleton h-4 w-24 rounded" />
          </div>
          <SkeletonRecommendation />
        </div>
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-xl mb-2">😔 {error || '未找到推荐结果'}</p>
          <p className="text-zinc-500 mb-4">请尝试重新生成推荐</p>
          <Button onClick={() => router.push('/profile')}>重新生成推荐</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header with Share Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>智业罗盘</span>
              <span>•</span>
              <span>AI推荐结果</span>
            </div>
            {/* Top Share Button - Compact */}
            <Button
              onClick={() => setShowShareModal(true)}
              size="sm"
              variant="outline"
              className="min-h-[36px] mobile-active no-tap-highlight flex items-center gap-1"
            >
              <span>📤</span>
              <span className="hidden sm:inline">分享</span>
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {recommendation.title}
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {recommendation.summary}
          </p>
        </div>

        {/* User Summary & Recommendation Reason */}
        {(recommendation.userSummary || recommendation.recommendationReason) && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* User Summary Card */}
            {recommendation.userSummary && (
              <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <span>👤</span> 您的情况
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {recommendation.userSummary}
                </p>
              </Card>
            )}

            {/* Recommendation Reason Card */}
            {recommendation.recommendationReason && (
              <Card className="p-4 border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <span>💡</span> 为什么推荐这个项目
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {recommendation.recommendationReason}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center">
            <p className="text-xs text-zinc-500">预期月收入</p>
            <p className="text-lg font-bold text-green-600">
              ¥{recommendation.revenue.monthlyMin.toLocaleString()}-{recommendation.revenue.monthlyMax.toLocaleString()}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-zinc-500">启动成本</p>
            <p className="text-lg font-bold">
              ¥{recommendation.startupCost.min.toLocaleString()}-{recommendation.startupCost.max.toLocaleString()}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-zinc-500">回本周期</p>
            <p className="text-lg font-bold">
              {recommendation.revenue.breakevenMonths}个月
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-xs text-zinc-500">推荐指数</p>
            <p className="text-lg font-bold text-yellow-500">★★★★☆</p>
          </Card>
        </div>

        {/* Description */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-2">项目详情</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {recommendation.description}
          </p>
        </Card>

        {/* Work Content */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">日常工作内容</h3>
          <ul className="space-y-2">
            {recommendation.workContent.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-blue-500">📋</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Success Factors */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">成功关键因素</h3>
          <ul className="space-y-2">
            {recommendation.successFactors.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-green-500">🔑</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Risk Assessment */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span> 风险评估与规避建议
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <RiskCard
              title="法律风险"
              risk={recommendation.riskAssessment.legal}
              icon="⚖️"
            />
            <RiskCard
              title="财务风险"
              risk={recommendation.riskAssessment.financial}
              icon="💰"
            />
            <RiskCard
              title="平台风险"
              risk={recommendation.riskAssessment.platform}
              icon="📱"
            />
            <RiskCard
              title="竞争风险"
              risk={recommendation.riskAssessment.competition}
              icon="🏃"
            />
          </div>
        </div>

        {/* Roadmap */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🗺️</span> 行动路径
          </h3>
          <RoadmapTimeline roadmap={recommendation.roadmap} />
        </Card>

        {/* Case Studies */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span>📚</span> 真实案例参考
          </h3>
          <CaseStudyCard caseStudy={recommendation.failureCase} type="failure" />
          <CaseStudyCard caseStudy={recommendation.successCase} type="success" />
        </div>

        {/* Action Button - Regenerate */}
        <div className="mb-6">
          <Button
            onClick={handleRegenerate}
            variant="outline"
            className="w-full min-h-[48px] text-base mobile-active no-tap-highlight"
          >
            🔄 重新生成推荐
          </Button>
        </div>

        {/* Share Panel - QR Code Focused */}
        <div className="mb-6">
          <SharePanel
            shareUrl={shareUrl}
            title={recommendation.title}
            summary={recommendation.summary}
            variant="full"
          />
        </div>

        {/* Feedback */}
        <div className="mb-6">
          <FeedbackPanel
            recommendationId={params.id as string}
            recommendationTitle={recommendation.title}
          />
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">⚠️ 免责声明</p>
          <p className="mt-1">
            以上推荐仅供参考，不构成投资建议。案例数据来源于网络整理，实际情况可能有所不同。
            创业有风险，请根据自身情况谨慎决策。
          </p>
        </div>
      </div>

      {/* Floating Share Button for Mobile */}
      <FloatingShareButton
        onClick={() => setShowShareModal(true)}
        className="md:hidden"
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
        title={recommendation.title}
        summary={recommendation.summary}
      />
    </div>
  );
}
