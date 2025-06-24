# Nuxt.js 3 TodoList 应用

一个功能完整的全栈 TodoList 应用，使用 Nuxt.js 3、TypeScript、Tailwind CSS、Supabase 和 Pinia 构建。

## ✨ 功能特性

- 🔐 **用户认证系统** - 注册、登录、登出
- 📝 **Todo CRUD 操作** - 创建、读取、更新、删除待办事项
- 🏷️ **分类管理** - 创建和管理待办事项分类
- 🎯 **优先级设置** - 低、中、高三个优先级
- 📅 **截止日期** - 设置和跟踪任务截止时间
- 🔍 **过滤和搜索** - 按状态、分类过滤待办事项
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🌙 **深色模式** - 支持明暗主题切换
- ⚡ **实时更新** - 数据实时同步
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 🎨 **现代 UI** - 使用 Nuxt UI 和 Tailwind CSS

## 🛠️ 技术栈

- **前端框架**: Nuxt.js 3
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS / Nuxt UI
- **状态管理**: Pinia
- **后端服务**: Supabase (数据库 + 认证)
- **图标库**: Lucide Icons
- **包管理器**: pnpm

## 📋 环境要求

- Node.js 18+ 
- pnpm 8+
- Supabase 账户

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd nuxt-todolist
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制 `.env.example` 为 `.env`
3. 填入你的 Supabase 配置：

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 设置数据库

在 Supabase SQL 编辑器中执行 `supabase-setup.sql` 文件中的 SQL 语句来创建必要的表和安全策略。

### 5. 启动开发服务器

```bash
pnpm run dev
```

应用将在 `http://localhost:3000` 启动。

## 📁 项目结构

```
nuxt-todolist/
├── assets/css/           # 样式文件
├── components/           # Vue 组件
│   ├── AppHeader.vue     # 应用头部
│   ├── TodoForm.vue      # Todo 表单
│   ├── TodoList.vue      # Todo 列表
│   ├── TodoItem.vue      # Todo 项目
│   ├── TodoStats.vue     # 统计信息
│   └── TodoFilters.vue   # 过滤器
├── layouts/              # 布局组件
├── middleware/           # 路由中间件
├── pages/                # 页面组件
│   ├── index.vue         # 主页
│   └── auth/             # 认证页面
├── plugins/              # 插件
├── server/api/           # API 路由
├── stores/               # Pinia 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
└── nuxt.config.ts        # Nuxt 配置
```

## 🔧 主要功能说明

### 用户认证
- 邮箱注册和登录
- 安全的会话管理
- 路由保护中间件

### Todo 管理
- 创建、编辑、删除待办事项
- 标记完成/未完成状态
- 设置优先级（低、中、高）
- 添加截止日期
- 分类管理

### 数据过滤
- 按状态过滤（全部、进行中、已完成）
- 按分类过滤
- 清除已完成的待办事项

### 响应式设计
- 移动端优先设计
- 平板和桌面端适配
- 触摸友好的交互

## 🏗️ 生产部署

### 构建应用

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

### 部署选项

- **Vercel**: 推荐，与 Nuxt.js 完美集成
- **Netlify**: 支持 SSR 和静态生成
- **Cloudflare Pages**: 边缘计算支持
- **自托管**: 使用 PM2 或 Docker

## 🧪 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 组件采用单文件组件 (SFC) 格式
- 使用 Pinia 进行状态管理

### 目录约定
- `components/` - 可复用的 Vue 组件
- `pages/` - 基于文件的路由页面
- `stores/` - Pinia 状态管理
- `middleware/` - 路由中间件
- `plugins/` - Nuxt 插件
- `utils/` - 工具函数
- `types/` - TypeScript 类型定义

## 🔒 安全特性

- 行级安全策略 (RLS)
- JWT 令牌认证
- CSRF 保护
- 输入验证和清理
- 安全的环境变量管理

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请创建 Issue 或联系开发者。
