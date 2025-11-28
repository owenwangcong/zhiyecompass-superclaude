import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zhiyecompass.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/recommendation/', // User-specific content
          '/profile', // Form page
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
