'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RecommendationSummary {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  loading?: boolean;
  error?: boolean;
}

export default function HistoryPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      // Get recommendation IDs from Session Storage
      const storedIds = sessionStorage.getItem('zhiyecompass_rec_ids');

      if (!storedIds) {
        setIsLoading(false);
        return;
      }

      const ids: string[] = JSON.parse(storedIds);

      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }

      // Initialize with loading placeholders (reverse order - newest first)
      const reversedIds = [...ids].reverse();
      setRecommendations(
        reversedIds.map((id) => ({
          id,
          title: '',
          summary: '',
          createdAt: '',
          loading: true,
        }))
      );
      setIsLoading(false);

      // Fetch each recommendation's details
      for (const id of reversedIds) {
        try {
          const response = await fetch(`/api/recommendation/${id}`);
          const data = await response.json();

          if (data.success && data.recommendation) {
            setRecommendations((prev) =>
              prev.map((rec) =>
                rec.id === id
                  ? {
                      id,
                      title: data.recommendation.title,
                      summary: data.recommendation.summary,
                      createdAt: data.recommendation.createdAt,
                      loading: false,
                    }
                  : rec
              )
            );
          } else {
            setRecommendations((prev) =>
              prev.map((rec) =>
                rec.id === id
                  ? { ...rec, loading: false, error: true }
                  : rec
              )
            );
          }
        } catch (error) {
          console.error(`Failed to fetch recommendation ${id}:`, error);
          setRecommendations((prev) =>
            prev.map((rec) =>
              rec.id === id
                ? { ...rec, loading: false, error: true }
                : rec
            )
          );
        }
      }
    };

    loadRecommendations();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearHistory = () => {
    if (confirm('确定要清除所有历史推荐记录吗？')) {
      sessionStorage.removeItem('zhiyecompass_rec_ids');
      setRecommendations([]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              历史推荐
            </h1>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                获取新推荐
              </Button>
            </Link>
          </div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            查看您之前获取的所有副业推荐
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-blue-500" />
            <p className="mt-4 text-zinc-500">加载中...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              暂无历史推荐
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              您还没有获取过任何推荐，开始探索适合您的副业吧！
            </p>
            <Link href="/profile">
              <Button>获取AI推荐</Button>
            </Link>
          </Card>
        )}

        {/* Recommendation List */}
        {!isLoading && recommendations.length > 0 && (
          <>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`p-4 transition-all hover:shadow-md ${
                    rec.loading || rec.error ? 'opacity-70' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!rec.loading && !rec.error) {
                      router.push(`/recommendation/${rec.id}`);
                    }
                  }}
                >
                  {rec.loading ? (
                    <div className="animate-pulse">
                      <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                    </div>
                  ) : rec.error ? (
                    <div className="text-zinc-500">
                      <p className="font-medium">加载失败</p>
                      <p className="text-sm">推荐ID: {rec.id.slice(0, 8)}...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {rec.title}
                        </h3>
                        <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
                          {formatDate(rec.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {rec.summary}
                      </p>
                      <div className="mt-3 flex items-center text-blue-500 text-sm">
                        <span>查看详情</span>
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* Clear History Button */}
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-zinc-500 hover:text-red-500"
              >
                清除历史记录
              </Button>
            </div>
          </>
        )}

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
