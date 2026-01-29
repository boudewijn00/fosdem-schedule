import { defineConfig, drivers, store } from '@adonisjs/cache'
import app from '@adonisjs/core/services/app'

const cacheConfig = defineConfig({
  default: 'file',
  stores: {
    file: store().useL2Layer(drivers.file({ directory: app.tmpPath('cache') })),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
