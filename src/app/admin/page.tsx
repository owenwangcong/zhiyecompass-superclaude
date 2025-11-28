'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Settings,
  BarChart3,
  MessageSquare,
  LogOut,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Home,
} from 'lucide-react';

interface SystemConfig {
  hourlyLimit: number;
  llmModel: 'claude' | 'gpt-4' | 'deepseek';
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [hourlyLimit, setHourlyLimit] = useState('10');
  const [llmModel, setLlmModel] = useState<'claude' | 'gpt-4' | 'deepseek'>('gpt-4');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        setIsAuthenticated(true);
        loadConfig();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
        setHourlyLimit(data.config.hourlyLimit.toString());
        setLlmModel(data.config.llmModel);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hourlyLimit: parseInt(hourlyLimit, 10),
          llmModel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setMessage({ type: 'success', text: '配置已保存' });
      } else {
        setMessage({ type: 'error', text: data.message || '保存失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              className="border-b-2 border-primary text-primary px-1 py-4 text-sm font-medium flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              系统配置
            </Link>
            <Link
              href="/admin/stats"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium flex items-center"
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Hourly Limit Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">每小时推荐限额</CardTitle>
              <CardDescription>
                控制系统每小时生成推荐的最大次数，用于控制LLM API成本
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyLimit">限额数量</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="hourlyLimit"
                      type="number"
                      min="1"
                      max="100"
                      value={hourlyLimit}
                      onChange={(e) => setHourlyLimit(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">次/小时</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  建议设置: 10-20次/小时。超过限额后，用户将收到友好提示，下一个小时自动重置。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* LLM Model Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">LLM模型选择</CardTitle>
              <CardDescription>
                选择用于生成推荐的AI模型
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={llmModel} onValueChange={(v) => setLlmModel(v as typeof llmModel)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value="gpt-4" id="gpt-4" />
                  <Label htmlFor="gpt-4" className="flex-1 cursor-pointer">
                    <div className="font-medium">GPT-4o (OpenAI)</div>
                    <div className="text-sm text-muted-foreground">推荐使用，性价比高</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value="claude" id="claude" />
                  <Label htmlFor="claude" className="flex-1 cursor-pointer">
                    <div className="font-medium">Claude (Anthropic)</div>
                    <div className="text-sm text-muted-foreground">高质量输出，成本较高</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value="deepseek" id="deepseek" />
                  <Label htmlFor="deepseek" className="flex-1 cursor-pointer">
                    <div className="font-medium">DeepSeek</div>
                    <div className="text-sm text-muted-foreground">国产模型，成本最低</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Save Button and Message */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="w-auto inline-flex">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {config && (
              <span className="text-sm text-muted-foreground">
                上次更新: {new Date(config.updatedAt).toLocaleString('zh-CN')}
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存配置
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">配置说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">每小时限额</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>限额会在每个整点自动重置</li>
                <li>当前小时的使用量可在"数据统计"页面查看</li>
                <li>修改限额后立即生效</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">LLM模型</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>GPT-4o</strong>: 默认推荐，输出质量高且成本适中</li>
                <li><strong>Claude</strong>: 适合需要更深度分析的场景</li>
                <li><strong>DeepSeek</strong>: 成本最低，适合高流量场景</li>
              </ul>
            </div>
            <div>
              <strong className="text-foreground">成本估算（每100次推荐）</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>GPT-4o: 约 $5-10</li>
                <li>Claude: 约 $8-15</li>
                <li>DeepSeek: 约 $1-3</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
