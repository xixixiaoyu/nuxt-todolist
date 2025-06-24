# 04. Supabase 集成和配置

本章详细介绍如何集成 Supabase 作为后端服务，包括项目创建、客户端配置、认证设置等核心功能。

## 🎯 学习目标

- 了解 Supabase 的核心概念和优势
- 学会创建和配置 Supabase 项目
- 掌握 Supabase 客户端的集成方法
- 理解认证和安全配置

## 🌟 Supabase 简介

### 什么是 Supabase？

Supabase 是一个开源的 Firebase 替代品，提供：

- 🗄️ **PostgreSQL 数据库**: 功能强大的关系型数据库
- 🔐 **认证系统**: 内置用户认证和授权
- 📡 **实时订阅**: WebSocket 实时数据同步
- 📁 **文件存储**: 对象存储服务
- 🔧 **边缘函数**: 服务端逻辑处理
- 📊 **自动 API**: 基于数据库模式自动生成 RESTful API

### 为什么选择 Supabase？

1. **开源**: 完全开源，可自托管
2. **PostgreSQL**: 成熟稳定的数据库
3. **类型安全**: 自动生成 TypeScript 类型
4. **实时功能**: 内置实时数据同步
5. **简单易用**: 开发体验友好

## 🚀 创建 Supabase 项目

### 1. 注册和创建项目

1. 访问 [Supabase](https://supabase.com)
2. 使用 GitHub 账号注册
3. 点击 "New Project" 创建项目
4. 填写项目信息：
   - **Name**: `nuxt-todolist`
   - **Database Password**: 设置强密码
   - **Region**: 选择最近的区域

### 2. 获取项目配置

项目创建完成后，在 Settings > API 页面获取：

```bash
# 项目 URL
Project URL: https://your-project-id.supabase.co

# 公开的匿名密钥
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 服务角色密钥（保密）
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 配置环境变量

```bash
# .env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## 🔧 客户端集成

### 1. 安装依赖

```bash
# 安装 Supabase 客户端
pnpm add @supabase/supabase-js
```

### 2. 创建 Supabase 插件

```typescript
// plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // 创建 Supabase 客户端
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    {
      auth: {
        // 认证配置
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      // 实时配置
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
})
```

### 3. 创建组合式函数

```typescript
// composables/useSupabase.ts
export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  return $supabase
}

// 类型安全的 Supabase 客户端
export const useSupabaseClient = () => {
  const supabase = useSupabase()
  return supabase as SupabaseClient<Database>
}
```

## 🔐 认证配置

### 1. 认证设置

在 Supabase Dashboard > Authentication > Settings 配置：

```json
{
  "site_url": "http://localhost:3000",
  "redirect_urls": [
    "http://localhost:3000",
    "http://localhost:3000/auth/callback",
    "https://your-domain.com",
    "https://your-domain.com/auth/callback"
  ]
}
```

### 2. 邮件模板配置

在 Authentication > Email Templates 自定义：

- **Confirm signup**: 注册确认邮件
- **Magic Link**: 魔法链接登录
- **Change Email Address**: 邮箱变更确认
- **Reset Password**: 密码重置邮件

### 3. 认证组合式函数

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref(null)
  const loading = ref(false)

  // 获取当前用户
  const getCurrentUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      return currentUser
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 注册
  const signUp = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // 登录
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      user.value = data.user
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      await navigateTo('/auth/login')
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  // 监听认证状态变化
  const initAuth = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
      
      if (event === 'SIGNED_IN') {
        console.log('用户已登录')
      } else if (event === 'SIGNED_OUT') {
        console.log('用户已登出')
      }
    })
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    initAuth
  }
}
```

## 📊 数据库操作

### 1. 基础 CRUD 操作

```typescript
// composables/useTodos.ts
export const useTodos = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()

  // 获取所有 todos
  const fetchTodos = async () => {
    if (!user.value) return []

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取 todos 失败:', error)
      throw error
    }

    return data || []
  }

  // 创建 todo
  const createTodo = async (todoData: TodoInsert) => {
    if (!user.value) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todoData,
        user_id: user.value.id
      })
      .select()
      .single()

    if (error) {
      console.error('创建 todo 失败:', error)
      throw error
    }

    return data
  }

  // 更新 todo
  const updateTodo = async (id: string, updates: TodoUpdate) => {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.value?.id)
      .select()
      .single()

    if (error) {
      console.error('更新 todo 失败:', error)
      throw error
    }

    return data
  }

  // 删除 todo
  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value?.id)

    if (error) {
      console.error('删除 todo 失败:', error)
      throw error
    }
  }

  return {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo
  }
}
```

### 2. 实时订阅

```typescript
// composables/useRealtimeTodos.ts
export const useRealtimeTodos = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const todos = ref<Todo[]>([])

  // 订阅实时更新
  const subscribeToTodos = () => {
    if (!user.value) return

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.value.id}`
        },
        (payload) => {
          console.log('实时更新:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              todos.value.unshift(payload.new as Todo)
              break
            case 'UPDATE':
              const index = todos.value.findIndex(t => t.id === payload.new.id)
              if (index !== -1) {
                todos.value[index] = payload.new as Todo
              }
              break
            case 'DELETE':
              todos.value = todos.value.filter(t => t.id !== payload.old.id)
              break
          }
        }
      )
      .subscribe()

    return channel
  }

  return {
    todos: readonly(todos),
    subscribeToTodos
  }
}
```

## 🔒 安全配置

### 1. 行级安全策略 (RLS)

```sql
-- 启用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户只能查看自己的 todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的 todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的 todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的 todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. 数据验证

```typescript
// 服务端验证
export default defineEventHandler(async (event) => {
  const supabase = createClient(
    useRuntimeConfig().public.supabaseUrl,
    useRuntimeConfig().supabaseServiceKey
  )

  // 验证用户身份
  const token = getCookie(event, 'sb-access-token')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // 继续处理请求...
})
```

## 🎯 本章小结

在本章中，我们完成了：

1. ✅ **Supabase 项目创建**: 创建并配置了 Supabase 项目
2. ✅ **客户端集成**: 集成了 Supabase 客户端到 Nuxt 应用
3. ✅ **认证配置**: 配置了用户认证系统
4. ✅ **数据库操作**: 实现了基础的 CRUD 操作
5. ✅ **实时功能**: 配置了实时数据订阅
6. ✅ **安全策略**: 设置了行级安全策略

## 🤔 思考题

1. 为什么要使用行级安全策略而不是在应用层控制权限？
2. 实时订阅的优势和潜在问题是什么？
3. 如何在开发和生产环境中管理不同的 Supabase 配置？

## 📚 扩展阅读

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🔗 下一章

[05. 数据库设计和安全策略](./05-database-design.md) - 深入学习数据库表设计和安全策略配置。
