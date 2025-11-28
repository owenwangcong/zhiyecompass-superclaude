import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { homePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = homePageMetadata;

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            智业罗盘
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              历史推荐
            </Link>
            <Link href="/profile">
              <Button size="sm">获取推荐</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            找到适合你的副业
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            AI智能分析您的技能、时间和资金，为您推荐最匹配的副业/创业项目
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile">
              <Button size="lg" className="w-full sm:w-auto">
                开始获取推荐
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                查看历史推荐
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">精准匹配</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              根据您的技能、时间、资金等8个维度，AI智能匹配最适合的项目
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">风险透明</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              全面评估法律、财务、平台、竞争风险，提供具体规避建议
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">可执行路径</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              详细的行动计划和里程碑，让您清楚每一步该怎么做
            </p>
          </Card>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">如何使用</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">填写画像</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                填写您的基本信息、技能、可用时间和启动资金
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">AI分析</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                AI根据您的画像，分析最匹配的副业项目
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">获取方案</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                查看完整推荐，包含风险评估和行动路径
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">准备好开启您的副业之旅了吗？</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            只需2分钟填写画像，即可获取个性化的AI推荐
          </p>
          <Link href="/profile">
            <Button size="lg">立即开始</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-zinc-900 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-zinc-500">
          <p className="mb-2">
            ⚠️ 推荐结果仅供参考，不构成投资建议。创业有风险，请谨慎决策。
          </p>
          <p>© 2024 智业罗盘 - AI副业推荐平台</p>
        </div>
      </footer>
    </div>
  );
}
