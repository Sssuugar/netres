const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/, // 匹配文件名
            threshold: 10240, // 对超过10k的数据压缩
            deleteOriginalAssets: false // 不删除源文件
          })
        ]
      }
    }
  },
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
