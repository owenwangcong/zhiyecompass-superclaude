import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zhiyecompass.com';
const SITE_NAME = '智业罗盘';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '智业罗盘 - AI智能副业推荐平台',
    template: '%s | 智业罗盘',
  },
  description:
    '智业罗盘是面向中国用户的AI驱动副业推荐平台。基于您的技能、时间和资金，为您量身定制副业/创业项目推荐，包含详细的风险评估和行动路径。',
  keywords: [
    '副业推荐',
    '创业项目',
    'AI推荐',
    '智能推荐',
    '兼职',
    '赚钱',
    '副业指南',
    '创业指南',
    '被动收入',
    '技能变现',
  ],
  authors: [{ name: '智业罗盘团队' }],
  creator: '智业罗盘',
  publisher: '智业罗盘',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: '智业罗盘 - AI智能副业推荐平台',
    description:
      '基于您的技能、时间和资金，AI为您量身定制副业/创业项目推荐，包含详细的风险评估和行动路径。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '智业罗盘 - AI智能副业推荐平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '智业罗盘 - AI智能副业推荐平台',
    description:
      '基于您的技能、时间和资金，AI为您量身定制副业/创业项目推荐。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export const homePageMetadata: Metadata = {
  title: '智业罗盘 - 找到适合你的副业',
  description:
    'AI智能分析您的技能、时间和资金，为您推荐最匹配的副业/创业项目。只需2分钟填写画像，即可获取个性化推荐。',
  openGraph: {
    title: '智业罗盘 - 找到适合你的副业',
    description:
      'AI智能分析您的技能、时间和资金，为您推荐最匹配的副业/创业项目。',
  },
};

export const profilePageMetadata: Metadata = {
  title: '填写画像',
  description:
    '填写您的个人画像，包括技能、时间、资金等信息，AI将为您生成个性化的副业推荐。',
  robots: {
    index: false, // Don't index form pages
    follow: true,
  },
};

export const historyPageMetadata: Metadata = {
  title: '历史推荐',
  description: '查看您之前获取的所有副业推荐记录。',
  robots: {
    index: false,
    follow: true,
  },
};

export function generateRecommendationMetadata(
  title: string,
  summary: string,
  id: string
): Metadata {
  const pageUrl = `${SITE_URL}/recommendation/${id}`;

  return {
    title: title,
    description: summary,
    openGraph: {
      type: 'article',
      title: `${title} - 智业罗盘推荐`,
      description: summary,
      url: pageUrl,
      images: [
        {
          url: '/og-recommendation.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - 智业罗盘推荐`,
      description: summary,
    },
    robots: {
      index: false, // User-specific content
      follow: true,
    },
  };
}

export function generateShareMetadata(
  title: string,
  summary: string,
  id: string
): Metadata {
  const pageUrl = `${SITE_URL}/share/${id}`;

  return {
    title: `${title} - 朋友分享的副业推荐`,
    description: `来看看这个副业推荐：${summary}`,
    openGraph: {
      type: 'article',
      title: `${title} - 智业罗盘推荐`,
      description: `朋友分享的副业推荐：${summary}`,
      url: pageUrl,
      images: [
        {
          url: '/og-share.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - 智业罗盘推荐`,
      description: `朋友分享的副业推荐：${summary}`,
    },
    robots: {
      index: true, // Share pages can be indexed
      follow: true,
    },
  };
}

// JSON-LD Structured Data
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: '面向中国用户的AI驱动副业推荐平台',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: 'AI智能副业推荐平台',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/profile`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateRecommendationJsonLd(
  title: string,
  description: string,
  createdAt: string,
  id: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: createdAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/share/${id}`,
    },
  };
}
