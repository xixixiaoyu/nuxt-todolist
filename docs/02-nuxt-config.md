# 02. Nuxt.js 3 基础配置

本章深入介绍 Nuxt.js 3 的配置系统，包括模块配置、运行时配置、构建优化等核心概念。

## 🎯 学习目标

- 理解 Nuxt.js 3 配置系统
- 掌握模块系统的使用
- 学会配置运行时环境
- 了解构建和性能优化选项

## 📁 配置文件结构

### nuxt.config.ts 详解

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 兼容性日期 - 确保使用最新特性
  compatibilityDate: '2025-05-15',
  
  // 开发工具配置
  devtools: { enabled: true },
  
  // 模块配置
  modules: [
    '@nuxt/ui',        // UI 组件库
    '@pinia/nuxt',     // 状态管理
    '@vueuse/nuxt',    // 组合式工具
    '@nuxt/icon'       // 图标库
  ],
  
  // 运行时配置
  runtimeConfig: {
    // 服务端私有配置
    secretKey: process.env.SECRET_KEY,
    
    // 客户端公共配置
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      appName: 'TodoList App'
    }
  },
  
  // 应用配置
  app: {
    head: {
      title: 'TodoList - 高效任务管理',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '现代化的待办事项管理应用' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
```

## 🔧 模块系统详解

### 1. @nuxt/ui 配置

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  
  // UI 模块配置
  ui: {
    global: true,  // 全局注册组件
    icons: ['heroicons', 'lucide']  // 图标集
  },
  
  // Tailwind CSS 配置
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#eff6ff',
              500: '#3b82f6',
              900: '#1e3a8a'
            }
          }
        }
      }
    }
  }
})
```

### 2. @pinia/nuxt 配置

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  // Pinia 配置
  pinia: {
    autoImports: [
      'defineStore',  // 自动导入 defineStore
      'storeToRefs'   // 自动导入 storeToRefs
    ]
  }
})
```

### 3. @vueuse/nuxt 配置

```typescript
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt'],
  
  // VueUse 配置
  vueuse: {
    ssrHandlers: true  // 启用 SSR 处理器
  }
})
```

## 🌐 运行时配置

### 环境变量管理

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SECRET_KEY=your-secret-key
```

### 配置访问方式

```typescript
// 在组合式函数中使用
export default function useSupabase() {
  const config = useRuntimeConfig()
  
  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
}

// 在服务端 API 中使用
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // 访问私有配置（仅服务端）
  const secretKey = config.secretKey
  
  // 访问公共配置
  const appName = config.public.appName
})
```

## 📱 应用配置

### 1. 页面头部配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      title: 'TodoList',
      titleTemplate: '%s - 高效任务管理',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '现代化的待办事项管理应用，帮助您高效管理日常任务' },
        { name: 'keywords', content: 'todo, 待办事项, 任务管理, 效率工具' },
        { property: 'og:title', content: 'TodoList - 高效任务管理' },
        { property: 'og:description', content: '现代化的待办事项管理应用' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  }
})
```

### 2. 页面级头部配置

```vue
<!-- pages/index.vue -->
<script setup>
// 页面级 SEO 配置
useHead({
  title: '我的待办事项',
  meta: [
    { name: 'description', content: '查看和管理您的所有待办事项' }
  ]
})

// 动态 SEO
const { data: todos } = await useFetch('/api/todos')
useSeoMeta({
  title: `待办事项 (${todos.value?.length || 0})`,
  description: `您有 ${todos.value?.length || 0} 个待办事项需要处理`
})
</script>
```

## 🚀 性能优化配置

### 1. 构建优化

```typescript
export default defineNuxtConfig({
  // 实验性功能
  experimental: {
    payloadExtraction: false,  // 禁用 payload 提取
    inlineSSRStyles: false     // 禁用内联 SSR 样式
  },
  
  // Nitro 配置
  nitro: {
    compressPublicAssets: true,  // 压缩静态资源
    minify: true                 // 压缩输出
  },
  
  // Vite 配置
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    }
  }
})
```

### 2. 缓存配置

```typescript
export default defineNuxtConfig({
  routeRules: {
    // 首页预渲染
    '/': { prerender: true },
    
    // 认证页面 SPA 模式
    '/auth/**': { ssr: false },
    
    // API 路由缓存
    '/api/**': { 
      headers: { 'cache-control': 's-maxage=60' }
    }
  }
})
```

## 🔍 开发配置

### 1. 开发服务器配置

```typescript
export default defineNuxtConfig({
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  
  // 开发工具配置
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  
  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

### 2. 调试配置

```typescript
export default defineNuxtConfig({
  // 源码映射
  sourcemap: {
    server: true,
    client: true
  },
  
  // 日志配置
  logLevel: 'info'
})
```

## 📦 自动导入配置

### 1. 组件自动导入

```typescript
export default defineNuxtConfig({
  components: [
    {
      path: '~/components',
      pathPrefix: false  // 不使用路径前缀
    },
    {
      path: '~/components/ui',
      prefix: 'UI'  // UI 组件使用 UI 前缀
    }
  ]
})
```

### 2. 组合式函数自动导入

```typescript
export default defineNuxtConfig({
  imports: {
    dirs: [
      'composables',
      'utils/**'
    ]
  }
})
```

## 🎨 样式配置

### 1. CSS 配置

```typescript
export default defineNuxtConfig({
  css: [
    '~/assets/css/main.css'  // 全局样式
  ],
  
  // PostCSS 配置
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
```

### 2. 字体配置

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  }
})
```

## 🔒 安全配置

```typescript
export default defineNuxtConfig({
  security: {
    headers: {
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'upgrade-insecure-requests': true
      }
    }
  }
})
```

## 🎯 本章小结

在本章中，我们学习了：

1. ✅ **配置文件结构**: 理解了 nuxt.config.ts 的组织方式
2. ✅ **模块系统**: 掌握了如何配置和使用 Nuxt 模块
3. ✅ **运行时配置**: 学会了环境变量和配置管理
4. ✅ **性能优化**: 了解了构建和缓存优化选项
5. ✅ **开发配置**: 配置了开发环境和调试工具

## 🤔 思考题

1. 运行时配置中 `public` 和私有配置的区别是什么？
2. 为什么要使用模块系统而不是直接安装依赖？
3. 路由规则 `routeRules` 如何影响页面渲染模式？

## 📚 扩展阅读

- [Nuxt Configuration](https://nuxt.com/docs/api/configuration/nuxt-config)
- [Nuxt Modules](https://nuxt.com/modules)
- [Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)

## 🔗 下一章

[03. TypeScript 类型系统设计](./03-typescript-types.md) - 学习如何设计类型安全的应用架构。
