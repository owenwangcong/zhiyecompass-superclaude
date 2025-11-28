import type { Metadata } from 'next';
import { generateShareMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ id: string }>;
};

// Fetch recommendation data for metadata
async function getRecommendationPreview(id: string) {
  try {
    // In production, this would fetch from your API or database directly
    // For now, we'll use a placeholder that will be replaced by actual data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/recommendation/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.recommendation : null;
  } catch (error) {
    console.error('Failed to fetch recommendation for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recommendation = await getRecommendationPreview(id);

  if (!recommendation) {
    return {
      title: '副业推荐 - 智业罗盘',
      description: '查看朋友分享的副业推荐',
    };
  }

  return generateShareMetadata(
    recommendation.title,
    recommendation.summary,
    id
  );
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
