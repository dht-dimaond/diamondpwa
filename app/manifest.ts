import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Diamond Heist', 
    short_name: 'DHT',
    description: 'Mine to Earn $DHT',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/letter-d.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/letter-d.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}