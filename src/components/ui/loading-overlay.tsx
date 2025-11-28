'use client';

import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  messages?: string[];
  estimatedTime?: number; // in seconds
}

const DEFAULT_MESSAGES = [
  '正在分析您的个人画像...',
  'AI正在为您匹配最合适的项目...',
  '正在评估项目可行性...',
  '正在生成详细的项目方案...',
  '正在分析潜在风险...',
  '正在制定行动路径...',
  '即将完成，请稍候...',
];

export function LoadingOverlay({
  isLoading,
  messages = DEFAULT_MESSAGES,
  estimatedTime = 15,
}: LoadingOverlayProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    // Rotate messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    // Update progress bar (simulate progress, max 95%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = (95 - prev) / 20;
        return Math.min(prev + increment, 95);
      });
    }, estimatedTime * 10);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, messages.length, estimatedTime]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        {/* Animated AI Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Outer ring animation */}
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-30" />
            {/* Middle ring */}
            <div className="absolute inset-2 animate-pulse rounded-full bg-blue-300 opacity-40" />
            {/* Center icon */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg
                className="h-10 w-10 animate-bounce text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          AI 正在为您生成推荐
        </h3>

        {/* Dynamic message */}
        <div className="mb-6 h-6 text-center">
          <p
            className="animate-fade-in text-sm text-zinc-600 dark:text-zinc-400"
            key={currentMessageIndex}
          >
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dots animation */}
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Estimated time hint */}
        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
          预计需要 {estimatedTime} 秒左右，请耐心等待
        </p>
      </div>
    </div>
  );
}
