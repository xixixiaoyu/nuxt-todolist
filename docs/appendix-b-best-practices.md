# 附录 B: 最佳实践总结

本文档总结了在开发 Nuxt.js 3 TodoList 应用过程中的最佳实践和经验教训。

## 🎯 项目架构最佳实践

### 1. 文件组织结构

```
nuxt-todolist/
├── assets/              # 静态资源
│   └── css/            # 样式文件
├── components/         # 可复用组件
│   ├── ui/            # 基础 UI 组件
│   └── feature/       # 功能组件
├── composables/       # 组合式函数
├── layouts/           # 布局组件
├── middleware/        # 路由中间件
├── pages/             # 页面组件
├── plugins/           # Nuxt 插件
├── server/            # 服务端代码
│   ├── api/          # API 路由
│   ├── middleware/   # 服务端中间件
│   └── utils/        # 服务端工具
├── stores/            # Pinia 状态管理
├── types/             # TypeScript 类型
└── utils/             # 客户端工具函数
```

**原则：**
- 按功能而非技术分组
- 保持目录结构扁平
- 使用清晰的命名约定

### 2. 命名约定

```typescript
// 文件命名：kebab-case
todo-form.vue
user-profile.vue
api-client.ts

// 组件命名：PascalCase
<TodoForm />
<UserProfile />

// 变量和函数：camelCase
const userName = 'john'
const fetchUserData = () => {}

// 常量：SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 类型和接口：PascalCase
interface User {}
type TodoStatus = 'pending' | 'completed'
```

## 🔧 TypeScript 最佳实践

### 1. 类型定义策略

```typescript
// ✅ 好的做法：分离类型定义
// types/database.ts
export interface Todo {
  id: string
  title: string
  completed: boolean
}

// types/api.ts
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ❌ 避免：在组件中定义复杂类型
// components/TodoList.vue
interface ComplexTodoType { /* ... */ } // 不推荐
```

### 2. 类型安全的组合式函数

```typescript
// ✅ 好的做法：明确的返回类型
export function useTodos() {
  const todos = ref<Todo[]>([])
  const loading = ref<boolean>(false)
  
  const fetchTodos = async (): Promise<Todo[]> => {
    // 实现
  }
  
  return {
    todos: readonly(todos),
    loading: readonly(loading),
    fetchTodos
  } as const // 确保返回类型不变
}

// ❌ 避免：隐式 any 类型
export function useTodos() {
  const todos = ref([]) // 类型推断为 any[]
  // ...
}
```

### 3. 严格的 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 🏪 状态管理最佳实践

### 1. Store 设计原则

```typescript
// ✅ 好的做法：单一职责原则
export const useAuthStore = defineStore('auth', () => {
  // 只处理认证相关状态
})

export const useTodosStore = defineStore('todos', () => {
  // 只处理 Todo 相关状态
})

// ❌ 避免：巨大的单一 store
export const useAppStore = defineStore('app', () => {
  // 包含所有应用状态 - 不推荐
})
```

### 2. 状态更新模式

```typescript
// ✅ 好的做法：通过 actions 更新状态
const todosStore = useTodosStore()
await todosStore.addTodo(newTodo)

// ❌ 避免：直接修改状态
const todosStore = useTodosStore()
todosStore.todos.push(newTodo) // 不推荐
```

### 3. 错误处理

```typescript
// ✅ 好的做法：在 store 中处理错误
export const useTodosStore = defineStore('todos', () => {
  const error = ref<string | null>(null)
  
  const addTodo = async (todo: TodoInsert) => {
    try {
      error.value = null
      // API 调用
    } catch (err) {
      error.value = err.message
      throw err // 重新抛出以便组件处理
    }
  }
  
  return { error: readonly(error), addTodo }
})
```

## 🎨 组件设计最佳实践

### 1. 组件职责分离

```vue
<!-- ✅ 好的做法：单一职责组件 -->
<!-- TodoItem.vue - 只负责显示单个 todo -->
<template>
  <div class="todo-item">
    <input v-model="todo.completed" type="checkbox" />
    <span>{{ todo.title }}</span>
  </div>
</template>

<!-- TodoList.vue - 只负责列表渲染 -->
<template>
  <div>
    <TodoItem 
      v-for="todo in todos" 
      :key="todo.id" 
      :todo="todo" 
    />
  </div>
</template>
```

### 2. Props 和 Emits 类型化

```vue
<script setup lang="ts">
// ✅ 好的做法：明确的 Props 类型
interface Props {
  todo: Todo
  editable?: boolean
}

interface Emits {
  update: [todo: Todo]
  delete: [id: string]
}

const props = withDefaults(defineProps<Props>(), {
  editable: true
})

const emit = defineEmits<Emits>()
</script>
```

### 3. 组合式函数的使用

```vue
<script setup lang="ts">
// ✅ 好的做法：使用组合式函数封装逻辑
const { todos, loading, addTodo } = useTodos()
const { user, isAuthenticated } = useAuth()

// ❌ 避免：在组件中写复杂业务逻辑
const todos = ref([])
const loading = ref(false)
const addTodo = async (todo) => {
  // 大量业务逻辑 - 应该提取到组合式函数
}
</script>
```

## 🔒 安全最佳实践

### 1. 环境变量管理

```bash
# ✅ 好的做法：明确区分公开和私有配置
# .env
SUPABASE_URL=https://xxx.supabase.co          # 公开
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...      # 公开
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiI...   # 私有，仅服务端

# ❌ 避免：在客户端暴露敏感信息
SUPABASE_SERVICE_KEY=xxx # 不要在 public 配置中使用
```

### 2. API 安全

```typescript
// ✅ 好的做法：服务端验证
export default defineEventHandler(async (event) => {
  // 1. 验证认证
  const user = await authenticateUser(event)
  
  // 2. 验证权限
  if (!canAccessResource(user, resourceId)) {
    throw createError({ statusCode: 403 })
  }
  
  // 3. 验证输入
  const body = await readBody(event)
  const validation = validateInput(body)
  if (!validation.isValid) {
    throw createError({ statusCode: 400, data: validation.errors })
  }
  
  // 4. 处理请求
})
```

### 3. 数据验证

```typescript
// ✅ 好的做法：双重验证（客户端 + 服务端）
// 客户端验证（用户体验）
const { validate } = useFormValidation(form, rules)
if (!validate()) return

// 服务端验证（安全性）
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = validateTodoData(body)
  if (!validation.isValid) {
    throw createError({ statusCode: 400 })
  }
})
```

## 🚀 性能优化最佳实践

### 1. 组件懒加载

```vue
<script setup lang="ts">
// ✅ 好的做法：懒加载大型组件
const TodoChart = defineAsyncComponent(() => import('~/components/TodoChart.vue'))
const TodoExport = defineAsyncComponent(() => import('~/components/TodoExport.vue'))
</script>

<template>
  <div>
    <!-- 条件渲染懒加载组件 -->
    <TodoChart v-if="showChart" />
    <TodoExport v-if="showExport" />
  </div>
</template>
```

### 2. 数据获取优化

```typescript
// ✅ 好的做法：使用 useLazyFetch 避免阻塞
const { data: todos, pending } = await useLazyFetch('/api/todos')

// ✅ 好的做法：缓存数据
const { data: categories } = await useFetch('/api/categories', {
  key: 'categories',
  default: () => []
})

// ❌ 避免：阻塞渲染
const todos = await $fetch('/api/todos') // 会阻塞页面渲染
```

### 3. 状态更新优化

```typescript
// ✅ 好的做法：批量更新
const updateMultipleTodos = async (updates: Array<{id: string, data: TodoUpdate}>) => {
  const promises = updates.map(({ id, data }) => updateTodo(id, data))
  await Promise.all(promises)
}

// ❌ 避免：频繁的单个更新
for (const update of updates) {
  await updateTodo(update.id, update.data) // 串行执行，性能差
}
```

## 🧪 测试最佳实践

### 1. 组件测试

```typescript
// ✅ 好的做法：测试组件行为而非实现
import { mount } from '@vue/test-utils'
import TodoItem from '~/components/TodoItem.vue'

test('should toggle todo completion', async () => {
  const todo = { id: '1', title: 'Test', completed: false }
  const wrapper = mount(TodoItem, { props: { todo } })
  
  await wrapper.find('input[type="checkbox"]').trigger('click')
  
  expect(wrapper.emitted('toggle')).toBeTruthy()
})
```

### 2. API 测试

```typescript
// ✅ 好的做法：模拟外部依赖
import { vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: mockTodos, error: null }))
    }))
  }))
}))
```

## 📝 代码质量最佳实践

### 1. 代码注释

```typescript
// ✅ 好的做法：解释为什么，而不是做什么
/**
 * 使用防抖来避免频繁的搜索请求
 * 用户停止输入 300ms 后才执行搜索
 */
const debouncedSearch = useDebounceFn(searchTodos, 300)

// ❌ 避免：显而易见的注释
const todos = ref([]) // 创建一个 todos 数组
```

### 2. 错误处理

```typescript
// ✅ 好的做法：具体的错误处理
try {
  await addTodo(newTodo)
} catch (error) {
  if (error.statusCode === 401) {
    await navigateTo('/auth/login')
  } else if (error.statusCode === 400) {
    showValidationErrors(error.data)
  } else {
    showGenericError('添加待办事项失败，请稍后重试')
  }
}

// ❌ 避免：忽略错误或泛泛处理
try {
  await addTodo(newTodo)
} catch (error) {
  console.log(error) // 不够
}
```

### 3. 代码复用

```typescript
// ✅ 好的做法：提取可复用逻辑
export function useAsyncOperation<T>(operation: () => Promise<T>) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const execute = async (...args: any[]) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await operation(...args)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return { loading: readonly(loading), error: readonly(error), execute }
}
```

## 🎯 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量**: 更易读、易维护的代码
2. **增强类型安全**: 减少运行时错误
3. **优化性能**: 更快的加载和响应速度
4. **提升安全性**: 保护用户数据和应用安全
5. **改善开发体验**: 更好的开发工具支持和调试体验

记住，最佳实践是指导原则，需要根据具体项目需求灵活应用。重要的是保持代码的一致性和可维护性。
