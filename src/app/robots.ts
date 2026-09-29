import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://socratop.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/', '/api/', '/auth/', '/profile/', '/equipment-detail/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
