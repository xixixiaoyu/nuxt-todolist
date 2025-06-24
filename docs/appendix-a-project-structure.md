# 附录 A: 项目结构详解

本文档详细解释了 Nuxt.js 3 TodoList 项目的文件组织结构和各个目录的作用。

## 📁 完整项目结构

```
nuxt-todolist/
├── .env.example                 # 环境变量示例文件
├── .gitignore                   # Git 忽略文件配置
├── .nuxt/                       # Nuxt 构建输出目录（自动生成）
├── .output/                     # 生产构建输出目录
├── README.md                    # 项目说明文档
├── app.vue                      # 根应用组件
├── assets/                      # 静态资源目录
│   └── css/
│       └── main.css            # 全局样式文件
├── components/                  # Vue 组件目录
│   ├── AppHeader.vue           # 应用头部组件
│   ├── ErrorMessage.vue        # 错误消息组件
│   ├── LoadingSpinner.vue      # 加载动画组件
│   ├── TodoFilters.vue         # Todo 过滤器组件
│   ├── TodoForm.vue            # Todo 表单组件
│   ├── TodoItem.vue            # Todo 项目组件
│   ├── TodoList.vue            # Todo 列表组件
│   └── TodoStats.vue           # Todo 统计组件
├── composables/                 # 组合式函数目录
├── docs/                        # 项目文档目录
│   ├── README.md               # 文档索引
│   ├── 01-project-setup.md     # 项目初始化文档
│   ├── 02-nuxt-config.md       # Nuxt 配置文档
│   ├── 03-typescript-types.md  # TypeScript 类型文档
│   ├── 04-supabase-setup.md    # Supabase 集成文档
│   ├── 05-database-design.md   # 数据库设计文档
│   ├── 06-api-routes.md        # API 路由文档
│   ├── 07-state-management.md  # 状态管理文档
│   ├── appendix-a-project-structure.md  # 项目结构详解
│   ├── appendix-b-best-practices.md     # 最佳实践总结
│   ├── appendix-c-faq.md               # 常见问题解答
│   └── appendix-d-extensions.md        # 扩展功能建议
├── layouts/                     # 布局组件目录
│   └── default.vue             # 默认布局
├── middleware/                  # 路由中间件目录
│   ├── auth.ts                 # 认证中间件
│   └── guest.ts                # 访客中间件
├── node_modules/               # 依赖包目录
├── nuxt.config.ts              # Nuxt 配置文件
├── package.json                # 项目配置和依赖
├── pages/                      # 页面组件目录
│   ├── auth/                   # 认证相关页面
│   │   ├── login.vue          # 登录页面
│   │   └── register.vue       # 注册页面
│   └── index.vue              # 首页
├── plugins/                    # Nuxt 插件目录
│   ├── error-handler.client.ts # 客户端错误处理插件
│   ├── init.client.ts          # 客户端初始化插件
│   └── supabase.client.ts      # Supabase 客户端插件
├── pnpm-lock.yaml              # pnpm 锁定文件
├── public/                     # 公共静态资源目录
│   ├── favicon.ico            # 网站图标
│   └── robots.txt             # 搜索引擎爬虫配置
├── server/                     # 服务端代码目录
│   ├── api/                   # API 路由目录
│   │   ├── categories/        # 分类相关 API
│   │   │   ├── index.get.ts   # 获取分类列表
│   │   │   └── index.post.ts  # 创建分类
│   │   └── todos/             # Todo 相关 API
│   │       ├── [id].delete.ts # 删除 Todo
│   │       ├── [id].put.ts    # 更新 Todo
│   │       ├── index.get.ts   # 获取 Todo 列表
│   │       └── index.post.ts  # 创建 Todo
│   ├── middleware/            # 服务端中间件
│   └── utils/                 # 服务端工具函数
├── stores/                    # Pinia 状态管理目录
│   ├── auth.ts               # 认证状态管理
│   └── todos.ts              # Todo 状态管理
├── supabase-setup.sql        # Supabase 数据库初始化脚本
├── test-app.js               # 应用测试脚本
├── tsconfig.json             # TypeScript 配置
├── types/                    # TypeScript 类型定义目录
│   ├── database.ts           # 数据库类型定义
│   └── index.ts              # 主要类型导出
└── utils/                    # 客户端工具函数目录
    ├── responsive.ts         # 响应式工具函数
    └── validation.ts         # 表单验证工具函数
```

## 📂 目录详细说明

### 核心配置文件

#### `nuxt.config.ts`
Nuxt.js 的主配置文件，定义了：
- 模块配置（@nuxt/ui, @pinia/nuxt 等）
- 运行时配置（环境变量）
- 构建配置
- 开发服务器配置

#### `package.json`
项目的包管理配置文件，包含：
- 项目元信息
- 依赖包列表
- 脚本命令
- 项目配置

#### `tsconfig.json`
TypeScript 编译配置，继承自 Nuxt 自动生成的配置。

### 应用入口

#### `app.vue`
应用的根组件，定义了：
- 全局布局结构
- 路由出口
- 全局组件

### 静态资源

#### `assets/`
需要构建处理的静态资源：
- CSS 文件
- 图片资源
- 字体文件

#### `public/`
直接提供的静态资源：
- favicon.ico
- robots.txt
- 其他不需要构建处理的文件

### 组件系统

#### `components/`
Vue 组件目录，Nuxt 会自动导入：
- **AppHeader.vue**: 应用头部，包含导航和用户菜单
- **TodoForm.vue**: Todo 创建/编辑表单
- **TodoList.vue**: Todo 列表容器
- **TodoItem.vue**: 单个 Todo 项目
- **TodoFilters.vue**: 过滤和搜索组件
- **TodoStats.vue**: 统计信息显示
- **LoadingSpinner.vue**: 加载动画组件
- **ErrorMessage.vue**: 错误消息显示组件

#### `layouts/`
布局组件目录：
- **default.vue**: 默认布局，包含基本的页面结构

### 路由系统

#### `pages/`
基于文件的路由系统：
- **index.vue**: 首页（`/`）
- **auth/login.vue**: 登录页面（`/auth/login`）
- **auth/register.vue**: 注册页面（`/auth/register`）

#### `middleware/`
路由中间件：
- **auth.ts**: 认证中间件，保护需要登录的页面
- **guest.ts**: 访客中间件，已登录用户不能访问的页面

### 服务端代码

#### `server/api/`
API 路由目录，使用文件名约定：
- **todos/index.get.ts**: `GET /api/todos`
- **todos/index.post.ts**: `POST /api/todos`
- **todos/[id].put.ts**: `PUT /api/todos/:id`
- **todos/[id].delete.ts**: `DELETE /api/todos/:id`
- **categories/index.get.ts**: `GET /api/categories`
- **categories/index.post.ts**: `POST /api/categories`

#### `server/middleware/`
服务端中间件，在所有 API 路由之前执行。

#### `server/utils/`
服务端工具函数，可在 API 路由中使用。

### 状态管理

#### `stores/`
Pinia 状态管理：
- **auth.ts**: 用户认证状态
  - 用户信息
  - 登录/注册/登出方法
  - 认证状态监听
- **todos.ts**: Todo 数据状态
  - Todo 列表
  - CRUD 操作方法
  - 过滤和搜索状态

### 插件系统

#### `plugins/`
Nuxt 插件目录：
- **supabase.client.ts**: Supabase 客户端初始化
- **init.client.ts**: 客户端初始化逻辑
- **error-handler.client.ts**: 全局错误处理

### 类型定义

#### `types/`
TypeScript 类型定义：
- **database.ts**: 数据库相关类型
- **index.ts**: 应用主要类型和导出

### 工具函数

#### `utils/`
客户端工具函数：
- **validation.ts**: 表单验证工具
- **responsive.ts**: 响应式设计工具

#### `composables/`
Vue 组合式函数（自动导入）

## 🔧 文件命名约定

### 组件命名
- **PascalCase**: `TodoForm.vue`, `AppHeader.vue`
- 使用描述性名称，体现组件功能

### 页面命名
- **kebab-case**: `login.vue`, `register.vue`
- 对应 URL 路径

### API 路由命名
- **HTTP 方法 + 扩展名**: `index.get.ts`, `[id].put.ts`
- 使用 RESTful 约定

### 类型文件命名
- **kebab-case**: `database.ts`, `api-types.ts`
- 使用描述性名称

### 工具函数命名
- **kebab-case**: `validation.ts`, `date-utils.ts`
- 按功能分组

## 📋 文件作用总结

| 目录/文件 | 作用 | 自动导入 |
|-----------|------|----------|
| `components/` | Vue 组件 | ✅ |
| `composables/` | 组合式函数 | ✅ |
| `layouts/` | 布局组件 | ✅ |
| `middleware/` | 路由中间件 | ✅ |
| `pages/` | 页面组件（路由） | ✅ |
| `plugins/` | Nuxt 插件 | ✅ |
| `server/api/` | API 路由 | ✅ |
| `stores/` | Pinia 状态管理 | ✅ |
| `utils/` | 工具函数 | ✅ |
| `types/` | 类型定义 | ❌ |
| `assets/` | 构建资源 | ❌ |
| `public/` | 静态资源 | ❌ |

## 🎯 最佳实践

### 1. 目录组织
- 按功能而非技术分组
- 保持目录结构扁平
- 使用清晰的命名约定

### 2. 文件大小
- 单个文件不超过 300 行
- 复杂组件拆分为子组件
- 大型工具函数按功能分割

### 3. 依赖关系
- 避免循环依赖
- 明确依赖层次
- 使用类型导入减少打包体积

### 4. 代码组织
- 相关文件放在同一目录
- 使用 index 文件统一导出
- 保持导入路径简洁

这种项目结构设计遵循了 Nuxt.js 3 的约定，同时保持了良好的可维护性和可扩展性。
