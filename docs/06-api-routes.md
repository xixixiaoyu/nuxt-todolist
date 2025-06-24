# 06. API 路由设计

本章详细介绍如何在 Nuxt.js 3 中设计和实现 RESTful API 路由，包括路由结构、中间件、错误处理等。

## 🎯 学习目标

- 理解 Nuxt.js 3 服务端 API 设计
- 掌握 RESTful API 设计原则
- 学会实现 CRUD 操作的 API 路由
- 了解 API 安全和错误处理

## 🏗️ API 路由架构

### 1. 路由文件结构

```
server/api/
├── todos/
│   ├── index.get.ts      # GET /api/todos
│   ├── index.post.ts     # POST /api/todos
│   ├── [id].get.ts       # GET /api/todos/:id
│   ├── [id].put.ts       # PUT /api/todos/:id
│   ├── [id].patch.ts     # PATCH /api/todos/:id
│   └── [id].delete.ts    # DELETE /api/todos/:id
├── categories/
│   ├── index.get.ts      # GET /api/categories
│   ├── index.post.ts     # POST /api/categories
│   └── [id].delete.ts    # DELETE /api/categories/:id
├── auth/
│   ├── me.get.ts         # GET /api/auth/me
│   └── logout.post.ts    # POST /api/auth/logout
└── stats/
    └── index.get.ts      # GET /api/stats
```

### 2. RESTful API 设计原则

| HTTP 方法 | 路径 | 描述 | 响应状态码 |
|-----------|------|------|------------|
| GET | `/api/todos` | 获取所有 todos | 200 |
| POST | `/api/todos` | 创建新 todo | 201 |
| GET | `/api/todos/:id` | 获取特定 todo | 200, 404 |
| PUT | `/api/todos/:id` | 完整更新 todo | 200, 404 |
| PATCH | `/api/todos/:id` | 部分更新 todo | 200, 404 |
| DELETE | `/api/todos/:id` | 删除 todo | 204, 404 |

## 📝 Todos API 实现

### 1. 获取 Todos 列表

```typescript
// server/api/todos/index.get.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    // 获取配置
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 从请求头获取认证信息
    const authorization = getHeader(event, 'authorization')
    if (!authorization) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    // 设置认证会话
    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // 获取查询参数
    const query = getQuery(event)
    const {
      filter = 'all',
      category,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query

    // 构建查询
    let queryBuilder = supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)

    // 应用过滤器
    if (filter === 'active') {
      queryBuilder = queryBuilder.eq('completed', false)
    } else if (filter === 'completed') {
      queryBuilder = queryBuilder.eq('completed', true)
    } else if (filter === 'overdue') {
      queryBuilder = queryBuilder
        .eq('completed', false)
        .lt('due_date', new Date().toISOString())
    }

    // 分类过滤
    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // 搜索过滤
    if (search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 排序
    const ascending = sortOrder === 'asc'
    queryBuilder = queryBuilder.order(sortBy as string, { ascending })

    // 分页
    const offset = (Number(page) - 1) * Number(limit)
    queryBuilder = queryBuilder.range(offset, offset + Number(limit) - 1)

    // 执行查询
    const { data: todos, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    // 返回结果
    return {
      data: todos || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        hasMore: (count || 0) > offset + Number(limit)
      }
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
```

### 2. 创建新 Todo

```typescript
// server/api/todos/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 认证检查
    const user = await authenticateUser(event, supabase)

    // 获取请求体
    const body = await readBody(event)
    
    // 验证请求数据
    const validationResult = validateTodoData(body)
    if (!validationResult.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: validationResult.errors
      })
    }

    // 准备插入数据
    const todoData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category: body.category || null,
      priority: body.priority || 'medium',
      due_date: body.due_date ? new Date(body.due_date).toISOString() : null,
      user_id: user.id
    }

    // 插入数据
    const { data: todo, error } = await supabase
      .from('todos')
      .insert(todoData)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    // 设置响应状态码为 201 (Created)
    setResponseStatus(event, 201)
    
    return {
      data: todo,
      message: 'Todo created successfully'
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})

// 验证函数
function validateTodoData(data: any) {
  const errors: string[] = []

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters')
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority must be low, medium, or high')
  }

  if (data.due_date && isNaN(Date.parse(data.due_date))) {
    errors.push('Invalid due date format')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### 3. 更新 Todo

```typescript
// server/api/todos/[id].put.ts
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 认证检查
    const user = await authenticateUser(event, supabase)

    // 获取 todo ID
    const todoId = getRouterParam(event, 'id')
    if (!todoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todo ID is required'
      })
    }

    // 获取请求体
    const body = await readBody(event)

    // 验证数据
    const validationResult = validateTodoUpdateData(body)
    if (!validationResult.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: validationResult.errors
      })
    }

    // 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    if (body.completed !== undefined) {
      updateData.completed = Boolean(body.completed)
    }
    if (body.category !== undefined) {
      updateData.category = body.category || null
    }
    if (body.priority !== undefined) {
      updateData.priority = body.priority
    }
    if (body.due_date !== undefined) {
      updateData.due_date = body.due_date ? new Date(body.due_date).toISOString() : null
    }

    // 更新数据
    const { data: todo, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', todoId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Todo not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return {
      data: todo,
      message: 'Todo updated successfully'
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
```

### 4. 删除 Todo

```typescript
// server/api/todos/[id].delete.ts
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 认证检查
    const user = await authenticateUser(event, supabase)

    // 获取 todo ID
    const todoId = getRouterParam(event, 'id')
    if (!todoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todo ID is required'
      })
    }

    // 删除数据
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    // 设置响应状态码为 204 (No Content)
    setResponseStatus(event, 204)
    
    return null

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
```

## 🏷️ Categories API 实现

### 1. 获取分类列表

```typescript
// server/api/categories/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 认证检查
    const user = await authenticateUser(event, supabase)

    // 获取分类数据
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return {
      data: categories || []
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
```

## 🔧 工具函数和中间件

### 1. 认证工具函数

```typescript
// server/utils/auth.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

export async function authenticateUser(event: any, supabase: any) {
  const authorization = getHeader(event, 'authorization')
  
  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header required'
    })
  }

  const token = authorization.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  return user
}
```

### 2. 错误处理中间件

```typescript
// server/middleware/error-handler.ts
export default defineEventHandler(async (event) => {
  try {
    // 继续处理请求
    return
  } catch (error: any) {
    // 记录错误
    console.error('API Error:', error)

    // 返回标准化错误响应
    if (error.statusCode) {
      setResponseStatus(event, error.statusCode)
      return {
        error: {
          statusCode: error.statusCode,
          statusMessage: error.statusMessage,
          data: error.data
        }
      }
    }

    // 未知错误
    setResponseStatus(event, 500)
    return {
      error: {
        statusCode: 500,
        statusMessage: 'Internal Server Error'
      }
    }
  }
})
```

### 3. CORS 中间件

```typescript
// server/middleware/cors.ts
export default defineEventHandler(async (event) => {
  // 设置 CORS 头
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
```

## 📊 统计 API

```typescript
// server/api/stats/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )

    // 认证检查
    const user = await authenticateUser(event, supabase)

    // 获取统计数据
    const { data: stats, error } = await supabase
      .rpc('get_user_todo_stats', { user_uuid: user.id })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return {
      data: stats
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
```

## 🎯 本章小结

在本章中，我们完成了：

1. ✅ **API 架构设计**: 设计了 RESTful API 路由结构
2. ✅ **CRUD 操作**: 实现了完整的增删改查功能
3. ✅ **认证和授权**: 添加了 API 安全验证
4. ✅ **错误处理**: 实现了统一的错误处理机制
5. ✅ **数据验证**: 添加了请求数据验证
6. ✅ **工具函数**: 创建了可复用的工具函数

## 🤔 思考题

1. 为什么要在 API 层进行数据验证而不只在前端验证？
2. 如何设计 API 的版本控制策略？
3. 什么情况下应该使用 PUT 而不是 PATCH？

## 📚 扩展阅读

- [RESTful API Design](https://restfulapi.net/)
- [Nitro Server Engine](https://nitro.unjs.io/)
- [HTTP Status Codes](https://httpstatuses.com/)

## 🔗 下一章

[07. 状态管理 (Pinia)](./07-state-management.md) - 学习如何使用 Pinia 进行应用状态管理。
