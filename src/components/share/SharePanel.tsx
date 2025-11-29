'use client';

import { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SharePanelProps {
  shareUrl: string;
  title: string;
  summary?: string;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export function SharePanel({
  shareUrl,
  title,
  summary,
  variant = 'full',
  className = '',
}: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const shareText = `我在智业罗盘发现了一个副业项目：${title}，快来看看适不适合你！`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [shareUrl]);

  const handleShareWeibo = useCallback(() => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, shareText]);

  const handleShareQQ = useCallback(() => {
    const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary || shareText)}`;
    window.open(qqUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, title, summary, shareText]);

  const handleShareXiaohongshu = useCallback(async () => {
    // 小红书没有开放分享API，复制文案供用户粘贴
    const xhsText = `🎯 发现一个适合副业的好项目！

【${title}】

${summary || shareText}

👉 点击链接查看详情：${shareUrl}

#副业 #创业 #赚钱 #智业罗盘`;

    try {
      await navigator.clipboard.writeText(xhsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // 可以考虑添加提示：已复制，请打开小红书粘贴发布
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [title, summary, shareText, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      handleCopyLink();
    }
  }, [title, shareText, shareUrl, handleCopyLink]);

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `智业罗盘-${title}-二维码.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [title]);

  // Compact inline variant for header
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={handleNativeShare}
          size="sm"
          variant="outline"
          className="min-h-[36px] mobile-active no-tap-highlight"
        >
          {copied ? '✓ 已复制' : '📤 分享'}
        </Button>
      </div>
    );
  }

  // Compact variant - horizontal buttons only
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="min-h-[40px] mobile-active no-tap-highlight"
        >
          {copied ? '✓ 已复制' : '🔗 复制'}
        </Button>
        <Button
          onClick={handleShareWeibo}
          size="sm"
          variant="outline"
          className="min-h-[40px] mobile-active no-tap-highlight"
        >
          📱 微博
        </Button>
        <Button
          onClick={handleShareQQ}
          size="sm"
          variant="outline"
          className="min-h-[40px] mobile-active no-tap-highlight"
        >
          🐧 QQ
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={handleNativeShare}
            size="sm"
            className="min-h-[40px] mobile-active no-tap-highlight"
          >
            📤 更多
          </Button>
        )}
      </div>
    );
  }

  // Full variant - QR code centered, compact layout
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold mb-3 text-center flex items-center justify-center gap-2">
        <span>📤</span> 扫码分享给好友
      </h3>

      {/* QR Code - Main Focus */}
      <div className="flex flex-col items-center mb-4">
        <div
          ref={qrRef}
          className="p-3 bg-white rounded-lg shadow-sm border"
        >
          <QRCodeSVG
            value={shareUrl}
            size={140}
            level="M"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500 text-center">
          用手机扫描二维码打开页面
        </p>
      </div>

      {/* Action Buttons - Centered Compact Row */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={handleDownloadQR}
          variant="outline"
          size="sm"
          className="min-h-[40px] min-w-[90px] mobile-active no-tap-highlight text-xs"
        >
          💾 保存图片
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="min-h-[40px] min-w-[90px] mobile-active no-tap-highlight text-xs"
        >
          {copied ? '✓ 已复制' : '🔗 复制链接'}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={handleNativeShare}
            size="sm"
            className="min-h-[40px] min-w-[70px] mobile-active no-tap-highlight text-xs"
          >
            📤 更多
          </Button>
        )}
      </div>

      {/* Social Share Row - Centered Secondary */}
      <div className="flex justify-center gap-2 mt-2">
        <Button
          onClick={handleShareXiaohongshu}
          variant="ghost"
          size="sm"
          className="min-h-[36px] min-w-[60px] text-xs text-zinc-600 hover:text-red-500"
        >
          📕 小红书
        </Button>
        <Button
          onClick={handleShareWeibo}
          variant="ghost"
          size="sm"
          className="min-h-[36px] min-w-[60px] text-xs text-zinc-600 hover:text-orange-600"
        >
          微博
        </Button>
        <Button
          onClick={handleShareQQ}
          variant="ghost"
          size="sm"
          className="min-h-[36px] min-w-[60px] text-xs text-zinc-600 hover:text-blue-600"
        >
          QQ
        </Button>
      </div>
    </Card>
  );
}

// Floating share button for mobile
export function FloatingShareButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center text-xl hover:bg-blue-600 active:scale-95 transition-all z-50 ${className}`}
      aria-label="分享"
    >
      📤
    </button>
  );
}

// Share modal for mobile - QR code focused
export function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  summary?: string;
}) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [shareUrl]);

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `智业罗盘-${title}-二维码.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [title]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `我在智业罗盘发现了一个副业项目：${title}，快来看看适不适合你！`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      handleCopyLink();
    }
  }, [title, shareUrl, handleCopyLink]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl p-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">扫码分享给好友</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 text-xl p-1"
          >
            ✕
          </button>
        </div>

        {/* QR Code - Main Focus */}
        <div className="flex flex-col items-center mb-4">
          <div
            ref={qrRef}
            className="p-3 bg-white rounded-lg shadow-sm border"
          >
            <QRCodeSVG
              value={shareUrl}
              size={160}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 text-center">
            用手机扫描二维码打开页面
          </p>
        </div>

        {/* Action Buttons - Centered */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={handleDownloadQR}
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[90px] mobile-active no-tap-highlight"
          >
            💾 保存图片
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[90px] mobile-active no-tap-highlight"
          >
            {copied ? '✓ 已复制' : '🔗 复制链接'}
          </Button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              onClick={handleNativeShare}
              size="sm"
              className="min-h-[44px] min-w-[70px] mobile-active no-tap-highlight"
            >
              📤 更多
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
