import { siteConfig } from './siteConfig'

export default function sitemap() {
  const now = new Date().toISOString()
  const base = siteConfig.url
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]
}


