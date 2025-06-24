# 01. 项目初始化和环境配置

本章将详细介绍如何从零开始创建 Nuxt.js 3 TodoList 项目，包括环境准备、项目初始化和基础配置。

## 🎯 学习目标

- 了解项目开发环境要求
- 掌握 Nuxt.js 3 项目初始化流程
- 理解现代前端项目的基础结构
- 配置包管理器和开发工具

## 📋 环境要求

### 必需软件
```bash
# Node.js 版本要求
Node.js >= 18.0.0

# 包管理器
pnpm >= 8.0.0 (推荐)
# 或者 npm >= 9.0.0
# 或者 yarn >= 1.22.0

# Git 版本控制
Git >= 2.0.0
```

### 验证环境
```bash
# 检查 Node.js 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 如果没有 pnpm，可以安装
npm install -g pnpm
```

## 🚀 项目初始化

### 1. 使用 Nuxt CLI 创建项目

```bash
# 使用官方 CLI 创建项目
npx nuxi@latest init nuxt-todolist

# 进入项目目录
cd nuxt-todolist
```

**为什么选择 Nuxt.js 3？**
- 🔥 **全栈框架**: 支持 SSR、SSG、SPA 多种渲染模式
- ⚡ **性能优异**: 基于 Vite 的快速开发体验
- 🛠️ **开箱即用**: 内置路由、状态管理、SEO 优化
- 🔧 **TypeScript**: 原生 TypeScript 支持
- 📱 **现代化**: Vue 3 + Composition API

### 2. 配置包管理器

```bash
# 删除默认的 package-lock.json
rm package-lock.json

# 删除 node_modules（如果存在）
rm -rf node_modules

# 使用 pnpm 安装依赖
pnpm install
```

**为什么选择 pnpm？**
- 🚀 **速度快**: 比 npm/yarn 快 2-3 倍
- 💾 **节省空间**: 硬链接机制避免重复下载
- 🔒 **安全性**: 严格的依赖解析
- 🎯 **兼容性**: 完全兼容 npm 生态

### 3. 项目结构概览

初始化后的项目结构：
```
nuxt-todolist/
├── .nuxt/              # 构建输出目录（自动生成）
├── node_modules/       # 依赖包
├── public/             # 静态资源
│   ├── favicon.ico
│   └── robots.txt
├── server/             # 服务端代码
│   └── tsconfig.json
├── .gitignore          # Git 忽略文件
├── app.vue             # 根组件
├── nuxt.config.ts      # Nuxt 配置文件
├── package.json        # 项目配置
├── README.md           # 项目说明
└── tsconfig.json       # TypeScript 配置
```

## 🔧 基础配置

### 1. 查看初始配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true }
})
```

### 2. 安装核心依赖

```bash
# 安装项目所需的核心依赖
pnpm add @nuxt/ui @pinia/nuxt @supabase/supabase-js @vueuse/nuxt @nuxt/icon

# 查看安装的依赖
pnpm list
```

**依赖说明：**
- `@nuxt/ui`: Nuxt 官方 UI 组件库（包含 Tailwind CSS）
- `@pinia/nuxt`: Vue 3 状态管理库
- `@supabase/supabase-js`: Supabase 客户端 SDK
- `@vueuse/nuxt`: Vue 组合式工具库
- `@nuxt/icon`: 图标组件库

### 3. 更新 Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // 注册模块
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],
  
  // 运行时配置
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})
```

### 4. 创建环境变量文件

```bash
# 创建环境变量示例文件
touch .env.example
```

```env
# .env.example
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 创建项目目录结构

```bash
# 创建项目所需的目录
mkdir -p assets/css components layouts middleware pages plugins stores types utils
```

**目录说明：**
- `assets/`: 静态资源（CSS、图片等）
- `components/`: Vue 组件
- `layouts/`: 布局组件
- `middleware/`: 路由中间件
- `pages/`: 页面组件（基于文件的路由）
- `plugins/`: Nuxt 插件
- `stores/`: Pinia 状态管理
- `types/`: TypeScript 类型定义
- `utils/`: 工具函数

## 🧪 验证安装

### 1. 启动开发服务器

```bash
# 启动开发服务器
pnpm run dev
```

### 2. 验证功能

访问 `http://localhost:3000`，您应该看到 Nuxt 欢迎页面。

### 3. 检查开发工具

- 按 `Shift + Option + D` 打开 Nuxt DevTools
- 检查是否能正常访问开发工具面板

## 📝 配置文件详解

### package.json 脚本

```json
{
  "scripts": {
    "build": "nuxt build",      // 构建生产版本
    "dev": "nuxt dev",          // 启动开发服务器
    "generate": "nuxt generate", // 生成静态站点
    "preview": "nuxt preview",   // 预览生产版本
    "postinstall": "nuxt prepare" // 安装后准备工作
  }
}
```

### TypeScript 配置

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

Nuxt 3 自动生成 TypeScript 配置，无需手动配置。

## 🎯 本章小结

在本章中，我们完成了：

1. ✅ **环境准备**: 验证了开发环境要求
2. ✅ **项目初始化**: 使用 Nuxt CLI 创建项目
3. ✅ **依赖安装**: 安装了核心依赖包
4. ✅ **基础配置**: 配置了 Nuxt 和环境变量
5. ✅ **目录结构**: 创建了项目目录结构
6. ✅ **验证测试**: 确保项目能正常运行

## 🤔 思考题

1. 为什么选择 pnpm 而不是 npm 或 yarn？
2. Nuxt.js 3 相比传统 Vue SPA 有什么优势？
3. 环境变量的 `public` 配置有什么作用？

## 📚 扩展阅读

- [Nuxt.js 3 官方文档](https://nuxt.com/)
- [pnpm 官方文档](https://pnpm.io/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## 🔗 下一章

[02. Nuxt.js 3 基础配置](./02-nuxt-config.md) - 深入了解 Nuxt.js 3 的配置选项和最佳实践。
