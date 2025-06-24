# 03. TypeScript 类型系统设计

本章详细介绍如何为 TodoList 应用设计完整的 TypeScript 类型系统，确保代码的类型安全和开发体验。

## 🎯 学习目标

- 理解 TypeScript 在 Nuxt.js 3 中的作用
- 设计数据库相关的类型定义
- 创建应用状态的类型系统
- 掌握类型安全的最佳实践

## 🏗️ 类型系统架构

### 类型文件组织结构

```
types/
├── index.ts           # 主要类型导出
├── database.ts        # 数据库类型定义
├── api.ts            # API 相关类型
├── auth.ts           # 认证相关类型
├── components.ts     # 组件 Props 类型
└── utils.ts          # 工具类型
```

## 📊 数据库类型设计

### 1. 基础数据库类型

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo
        Insert: TodoInsert
        Update: TodoUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority_level: 'low' | 'medium' | 'high'
      todo_status: 'pending' | 'completed' | 'archived'
    }
  }
}

// Todo 表类型
export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  category: string | null
  priority: Priority
  due_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// Todo 插入类型
export interface TodoInsert {
  id?: string
  title: string
  description?: string | null
  completed?: boolean
  category?: string | null
  priority?: Priority
  due_date?: string | null
  created_at?: string
  updated_at?: string
  user_id: string
}

// Todo 更新类型
export interface TodoUpdate {
  id?: string
  title?: string
  description?: string | null
  completed?: boolean
  category?: string | null
  priority?: Priority
  due_date?: string | null
  updated_at?: string
}
```

### 2. 分类相关类型

```typescript
// 分类表类型
export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface CategoryInsert {
  id?: string
  name: string
  color: string
  user_id: string
  created_at?: string
}

export interface CategoryUpdate {
  id?: string
  name?: string
  color?: string
  created_at?: string
}
```

## 👤 认证类型设计

```typescript
// types/auth.ts
export interface User {
  id: string
  email: string
  created_at: string
  updated_at?: string
  email_confirmed_at?: string
  last_sign_in_at?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User | null
  error: Error | null
}
```

## 🏪 状态管理类型

```typescript
// types/store.ts
export interface TodoState {
  todos: Todo[]
  categories: Category[]
  loading: boolean
  error: string | null
  filter: TodoFilter
  selectedCategory: string | null
  searchQuery: string
}

export interface TodoStats {
  total: number
  completed: number
  active: number
  overdue: number
}

export type TodoFilter = 'all' | 'active' | 'completed' | 'overdue'
export type Priority = 'low' | 'medium' | 'high'
export type SortBy = 'created_at' | 'due_date' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'
```

## 📝 表单类型设计

```typescript
// types/forms.ts
export interface TodoForm {
  title: string
  description: string
  category: string
  priority: Priority
  due_date: string | null
}

export interface CategoryForm {
  name: string
  color: string
}

export interface TodoFormErrors {
  title?: string[]
  description?: string[]
  category?: string[]
  priority?: string[]
  due_date?: string[]
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
```

## 🔌 API 类型设计

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  status: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface TodoQueryParams extends PaginationParams {
  filter?: TodoFilter
  category?: string
  search?: string
  sortBy?: SortBy
  sortOrder?: SortOrder
}

export interface TodoListResponse {
  todos: Todo[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

## 🎨 组件 Props 类型

```typescript
// types/components.ts
export interface TodoItemProps {
  todo: Todo
  editable?: boolean
  deletable?: boolean
  onEdit?: (todo: Todo) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
}

export interface TodoFormProps {
  editingTodo?: Todo | null
  categories?: Category[]
  onSubmit?: (data: TodoForm) => void
  onCancel?: () => void
}

export interface TodoFiltersProps {
  currentFilter: TodoFilter
  categories: Category[]
  selectedCategory: string | null
  onFilterChange: (filter: TodoFilter) => void
  onCategoryChange: (categoryId: string | null) => void
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  showText?: boolean
  fullScreen?: boolean
}
```

## 🛠️ 工具类型

```typescript
// types/utils.ts
// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 可选字段类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 必需字段类型
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
}

// 时间戳类型
export type Timestamp = string

// ID 类型
export type ID = string

// 颜色类型
export type Color = `#${string}` | 'transparent' | 'currentColor'

// 响应式断点类型
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 主题类型
export type Theme = 'light' | 'dark' | 'system'
```

## 🔄 类型守卫和工具函数

```typescript
// types/guards.ts
export function isTodo(obj: any): obj is Todo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean'
  )
}

export function isCategory(obj: any): obj is Category {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string'
  )
}

export function isPriority(value: any): value is Priority {
  return ['low', 'medium', 'high'].includes(value)
}

export function isTodoFilter(value: any): value is TodoFilter {
  return ['all', 'active', 'completed', 'overdue'].includes(value)
}
```

## 📤 类型导出

```typescript
// types/index.ts
// 数据库类型
export type { Database, Todo, TodoInsert, TodoUpdate, Category, CategoryInsert, CategoryUpdate } from './database'

// 认证类型
export type { User, AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from './auth'

// 状态管理类型
export type { TodoState, TodoStats, TodoFilter, Priority, SortBy, SortOrder } from './store'

// 表单类型
export type { TodoForm, CategoryForm, TodoFormErrors, ValidationRule, ValidationResult } from './forms'

// API 类型
export type { ApiResponse, ApiError, PaginationParams, TodoQueryParams, TodoListResponse } from './api'

// 组件类型
export type { TodoItemProps, TodoFormProps, TodoFiltersProps, LoadingSpinnerProps } from './components'

// 工具类型
export type { DeepReadonly, Optional, Required, Timestamp, ID, Color, Breakpoint, Theme } from './utils'

// 类型守卫
export { isTodo, isCategory, isPriority, isTodoFilter } from './guards'
```

## 🎯 类型安全最佳实践

### 1. 严格的 TypeScript 配置

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 2. 组合式函数的类型安全

```typescript
// composables/useTodos.ts
export function useTodos() {
  const todos = ref<Todo[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const addTodo = async (todoData: TodoInsert): Promise<Todo | null> => {
    // 实现逻辑
  }

  const updateTodo = async (id: string, updates: TodoUpdate): Promise<Todo | null> => {
    // 实现逻辑
  }

  return {
    todos: readonly(todos),
    loading: readonly(loading),
    error: readonly(error),
    addTodo,
    updateTodo
  }
}
```

### 3. 事件类型安全

```typescript
// 定义事件类型
interface TodoEvents {
  'todo:created': Todo
  'todo:updated': { id: string; todo: Todo }
  'todo:deleted': string
}

// 类型安全的事件发射
const emit = defineEmits<TodoEvents>()

// 使用
emit('todo:created', newTodo)
```

## 🎯 本章小结

在本章中，我们完成了：

1. ✅ **类型架构设计**: 建立了完整的类型系统架构
2. ✅ **数据库类型**: 定义了数据库相关的所有类型
3. ✅ **状态管理类型**: 创建了状态管理的类型定义
4. ✅ **表单验证类型**: 设计了表单和验证相关类型
5. ✅ **组件类型**: 定义了组件 Props 和事件类型
6. ✅ **类型安全实践**: 学习了类型安全的最佳实践

## 🤔 思考题

1. 为什么要分离 Insert、Update 和 Row 类型？
2. 类型守卫函数的作用是什么？
3. 如何在保持类型安全的同时提高开发效率？

## 📚 扩展阅读

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vue 3 TypeScript Support](https://vuejs.org/guide/typescript/overview.html)
- [Nuxt TypeScript](https://nuxt.com/docs/guide/concepts/typescript)

## 🔗 下一章

[04. Supabase 集成和配置](./04-supabase-setup.md) - 学习如何集成和配置 Supabase 后端服务。
