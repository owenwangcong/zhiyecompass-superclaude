import type { Metadata } from 'next';
import { historyPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = historyPageMetadata;

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
