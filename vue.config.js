const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    iconPaths: {
      favicon32: 'img/icons/N.svg',
      favicon16: 'img/icons/N.svg',
      appleTouchIcon: 'img/icons/N.svg',
      maskIcon: 'img/icons/N.svg',
      msTileImage: 'img/icons/N.svg'
    },
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: new RegExp('.*\\.mp4$'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'video-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            },
            cacheableResponse: {
              statuses: [0, 200]
            },
          },
        },
      ],
    }
  }
})
