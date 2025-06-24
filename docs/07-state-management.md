# 07. 状态管理 (Pinia)

本章详细介绍如何使用 Pinia 进行 Vue 3 应用的状态管理，包括 store 设计、状态持久化、最佳实践等。

## 🎯 学习目标

- 理解 Pinia 状态管理的核心概念
- 掌握 store 的设计和组织方式
- 学会实现响应式状态管理
- 了解状态持久化和 SSR 支持

## 🏪 Pinia 核心概念

### 1. 什么是 Pinia？

Pinia 是 Vue 3 的官方状态管理库，具有以下特点：

- 🍍 **类型安全**: 完整的 TypeScript 支持
- 🔧 **开发工具**: 优秀的 Vue DevTools 集成
- 🔥 **热重载**: 支持热模块替换
- 🧩 **模块化**: 支持代码分割
- 🚀 **轻量级**: 体积小，性能好

### 2. 核心概念

- **Store**: 状态容器，包含状态、getter 和 action
- **State**: 应用的数据状态
- **Getters**: 计算属性，基于状态派生数据
- **Actions**: 修改状态的方法，支持异步操作

## 🔧 Pinia 配置

### 1. 安装和配置

```bash
# 安装 Pinia
pnpm add @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  pinia: {
    autoImports: [
      'defineStore',
      'storeToRefs'
    ]
  }
})
```

### 2. Store 文件结构

```
stores/
├── auth.ts          # 认证状态
├── todos.ts         # Todo 状态
├── categories.ts    # 分类状态
├── ui.ts           # UI 状态
└── index.ts        # Store 导出
```

## 👤 认证 Store

```typescript
// stores/auth.ts
import type { User, AuthState } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  
  // Actions
  const signUp = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: authError } = await $supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (authError) throw authError
      
      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        }
      }
      
      return { data, error: null }
    } catch (err: any) {
      error.value = err.message
      console.error('注册错误:', err)
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }
  
  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: authError } = await $supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        }
      }
      
      return { data, error: null }
    } catch (err: any) {
      error.value = err.message
      console.error('登录错误:', err)
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }
  
  const signOut = async () => {
    loading.value = true
    
    try {
      const { $supabase } = useNuxtApp()
      const { error: authError } = await $supabase.auth.signOut()
      
      if (authError) throw authError
      
      user.value = null
      await navigateTo('/auth/login')
      
      return { error: null }
    } catch (err: any) {
      error.value = err.message
      console.error('登出错误:', err)
      return { error: err }
    } finally {
      loading.value = false
    }
  }
  
  const getCurrentUser = async () => {
    try {
      const { $supabase } = useNuxtApp()
      const { data: { user: currentUser } } = await $supabase.auth.getUser()
      
      if (currentUser) {
        user.value = {
          id: currentUser.id,
          email: currentUser.email!,
          created_at: currentUser.created_at
        }
      }
      
      return currentUser
    } catch (err: any) {
      console.error('获取用户信息错误:', err)
      return null
    }
  }
  
  const initialize = async () => {
    loading.value = true
    
    try {
      await getCurrentUser()
      
      // 监听认证状态变化
      const { $supabase } = useNuxtApp()
      $supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          user.value = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          }
        } else {
          user.value = null
        }
      })
    } finally {
      loading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // 状态
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    isAuthenticated,
    userEmail,
    
    // Actions
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    initialize,
    clearError
  }
})
```

## 📝 Todos Store

```typescript
// stores/todos.ts
import type { Todo, TodoInsert, TodoUpdate, TodoState } from '~/types'

export const useTodosStore = defineStore('todos', () => {
  const authStore = useAuthStore()
  
  // 状态
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filter = ref<'all' | 'active' | 'completed'>('all')
  const selectedCategory = ref<string | null>(null)
  const searchQuery = ref('')
  
  // Getters
  const filteredTodos = computed(() => {
    let filtered = todos.value
    
    // 按完成状态过滤
    if (filter.value === 'active') {
      filtered = filtered.filter(todo => !todo.completed)
    } else if (filter.value === 'completed') {
      filtered = filtered.filter(todo => todo.completed)
    }
    
    // 按分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(todo => todo.category === selectedCategory.value)
    }
    
    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(query) ||
        (todo.description && todo.description.toLowerCase().includes(query))
      )
    }
    
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })
  
  const todoStats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(todo => todo.completed).length
    const active = total - completed
    const overdue = todos.value.filter(todo => 
      !todo.completed && 
      todo.due_date && 
      new Date(todo.due_date) < new Date()
    ).length
    
    return { total, completed, active, overdue }
  })
  
  const todosByCategory = computed(() => {
    const grouped = todos.value.reduce((acc, todo) => {
      const category = todo.category || '未分类'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(todo)
      return acc
    }, {} as Record<string, Todo[]>)
    
    return grouped
  })
  
  // Actions
  const fetchTodos = async () => {
    if (!authStore.isAuthenticated) return
    
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: fetchError } = await $supabase
        .from('todos')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      todos.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('获取 todos 错误:', err)
    } finally {
      loading.value = false
    }
  }
  
  const addTodo = async (todoData: Omit<TodoInsert, 'user_id'>) => {
    if (!authStore.isAuthenticated) return
    
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: insertError } = await $supabase
        .from('todos')
        .insert({
          ...todoData,
          user_id: authStore.user!.id
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      todos.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('添加 todo 错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateTodo = async (id: string, updates: TodoUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: updateError } = await $supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = todos.value.findIndex(todo => todo.id === id)
      if (index !== -1) {
        todos.value[index] = data
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('更新 todo 错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteTodo = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { error: deleteError } = await $supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      todos.value = todos.value.filter(todo => todo.id !== id)
    } catch (err: any) {
      error.value = err.message
      console.error('删除 todo 错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const toggleTodo = async (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return
    
    await updateTodo(id, { completed: !todo.completed })
  }
  
  const setFilter = (newFilter: 'all' | 'active' | 'completed') => {
    filter.value = newFilter
  }
  
  const setSelectedCategory = (categoryId: string | null) => {
    selectedCategory.value = categoryId
  }
  
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }
  
  const clearCompleted = async () => {
    const completedTodos = todos.value.filter(todo => todo.completed)
    
    loading.value = true
    
    try {
      for (const todo of completedTodos) {
        await deleteTodo(todo.id)
      }
    } finally {
      loading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // 状态
    todos: readonly(todos),
    loading: readonly(loading),
    error: readonly(error),
    filter: readonly(filter),
    selectedCategory: readonly(selectedCategory),
    searchQuery: readonly(searchQuery),
    
    // Getters
    filteredTodos,
    todoStats,
    todosByCategory,
    
    // Actions
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    setSelectedCategory,
    setSearchQuery,
    clearCompleted,
    clearError
  }
})
```

## 🏷️ Categories Store

```typescript
// stores/categories.ts
import type { Category, CategoryInsert } from '~/types'

export const useCategoriesStore = defineStore('categories', () => {
  const authStore = useAuthStore()
  
  // 状态
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const categoryOptions = computed(() => 
    categories.value.map(cat => ({
      label: cat.name,
      value: cat.name,
      color: cat.color
    }))
  )
  
  // Actions
  const fetchCategories = async () => {
    if (!authStore.isAuthenticated) return
    
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: fetchError } = await $supabase
        .from('categories')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      categories.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('获取分类错误:', err)
    } finally {
      loading.value = false
    }
  }
  
  const addCategory = async (categoryData: Omit<CategoryInsert, 'user_id'>) => {
    if (!authStore.isAuthenticated) return
    
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { data, error: insertError } = await $supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: authStore.user!.id
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      categories.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('添加分类错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { $supabase } = useNuxtApp()
      const { error: deleteError } = await $supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      categories.value = categories.value.filter(cat => cat.id !== id)
    } catch (err: any) {
      error.value = err.message
      console.error('删除分类错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    // 状态
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    categoryOptions,
    
    // Actions
    fetchCategories,
    addCategory,
    deleteCategory,
    clearError
  }
})
```

## 🎨 UI Store

```typescript
// stores/ui.ts
export const useUIStore = defineStore('ui', () => {
  // 状态
  const sidebarOpen = ref(false)
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timeout?: number
  }>>([])
  
  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    theme.value = newTheme
  }
  
  const addNotification = (notification: Omit<typeof notifications.value[0], 'id'>) => {
    const id = Date.now().toString()
    notifications.value.push({ ...notification, id })
    
    // 自动移除通知
    if (notification.timeout !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.timeout || 5000)
    }
    
    return id
  }
  
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  return {
    // 状态
    sidebarOpen: readonly(sidebarOpen),
    theme: readonly(theme),
    notifications: readonly(notifications),
    
    // Actions
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['theme']
  }
})
```

## 🎯 本章小结

在本章中，我们完成了：

1. ✅ **Pinia 配置**: 配置了 Pinia 状态管理
2. ✅ **认证 Store**: 实现了用户认证状态管理
3. ✅ **Todos Store**: 创建了 Todo 数据状态管理
4. ✅ **Categories Store**: 实现了分类状态管理
5. ✅ **UI Store**: 添加了 UI 状态管理
6. ✅ **类型安全**: 确保了完整的 TypeScript 支持

## 🤔 思考题

1. 为什么使用 Composition API 风格的 store 而不是 Options API？
2. 如何在 SSR 环境中处理状态持久化？
3. 什么时候应该将状态放在 store 中而不是组件内部？

## 📚 扩展阅读

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Reactivity](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [State Management Patterns](https://vuejs.org/guide/scaling-up/state-management.html)

## 🔗 下一章

[08. 用户认证系统](./08-authentication.md) - 深入学习用户认证系统的实现。
