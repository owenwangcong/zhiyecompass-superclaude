'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  BarChart3,
  MessageSquare,
  LogOut,
  Loader2,
  Home,
  TrendingUp,
  Clock,
  Share2,
  Star,
  Activity,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface Stats {
  totalRecommendations: number;
  todayRecommendations: number;
  currentHourCount: number;
  currentHourLimit: number;
  currentHourKey: string;
  totalShares: number;
  averageFeedbackRating: number;
  feedbackCount: number;
  recentActivity: {
    type: string;
    timestamp: string;
    details: string;
  }[];
  dailyStats: {
    date: string;
    count: number;
  }[];
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        setIsAuthenticated(true);
        loadStats();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStats();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'feedback':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'recommendation':
        return '新推荐';
      case 'feedback':
        return '用户反馈';
      case 'share':
        return '分享';
      default:
        return type;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const quotaPercentage = stats
    ? Math.round((stats.currentHourCount / stats.currentHourLimit) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">智业罗盘 - 管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-primary flex items-center">
                <Home className="w-4 h-4 mr-1" />
                返回前台
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/admin"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              系统配置
            </Link>
            <Link
              href="/admin/stats"
              className="border-b-2 border-primary text-primary px-1 py-4 text-sm font-medium flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              数据统计
            </Link>
            <Link
              href="/admin/feedback"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              用户反馈
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">累计推荐</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecommendations || 0}</div>
              <p className="text-xs text-muted-foreground">总推荐生成次数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日推荐</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayRecommendations || 0}</div>
              <p className="text-xs text-muted-foreground">今日生成次数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本小时额度</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.currentHourCount || 0} / {stats?.currentHourLimit || 10}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    quotaPercentage >= 90 ? 'bg-red-500' : quotaPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">分享次数</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalShares || 0}</div>
              <p className="text-xs text-muted-foreground">累计分享次数</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Feedback Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">反馈统计</CardTitle>
              <CardDescription>用户反馈评分情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  <span className="text-3xl font-bold ml-2">
                    {stats?.averageFeedbackRating || 0}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>平均评分</div>
                  <div>共 {stats?.feedbackCount || 0} 条反馈</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">近7天趋势</CardTitle>
              <CardDescription>每日推荐生成数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-32 space-x-2">
                {stats?.dailyStats.map((day, index) => {
                  const maxCount = Math.max(...(stats?.dailyStats.map(d => d.count) || [1]));
                  const height = (day.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{day.date}</span>
                      <span className="text-xs font-medium">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">最近活动</CardTitle>
            <CardDescription>系统最近的操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{getActivityLabel(activity.type)}</span>
                      <span className="text-xs text-muted-foreground">{activity.details}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">数据说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">本小时额度</strong>: 每小时推荐次数限制，到达限额后用户需等待下一个小时。
            </p>
            <p>
              <strong className="text-foreground">反馈评分</strong>: 用户对推荐结果的1-5星评价，平均分越高说明推荐质量越好。
            </p>
            <p>
              <strong className="text-foreground">数据更新</strong>: 统计数据每5分钟自动更新，点击"刷新数据"可手动更新。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
