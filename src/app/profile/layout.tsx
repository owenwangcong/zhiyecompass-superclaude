import type { Metadata } from 'next';
import { profilePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = profilePageMetadata;

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
