# 附录 C: 常见问题解答 (FAQ)

本文档收集了在开发和使用 Nuxt.js 3 TodoList 应用过程中的常见问题和解决方案。

## 🚀 项目启动问题

### Q1: 运行 `pnpm run dev` 时出现模块找不到的错误

**问题描述：**
```bash
Error: Cannot find module '@nuxt/ui'
```

**解决方案：**
```bash
# 1. 清理依赖
rm -rf node_modules pnpm-lock.yaml

# 2. 重新安装
pnpm install

# 3. 如果还有问题，检查 Node.js 版本
node --version  # 确保 >= 18.0.0

# 4. 清理 Nuxt 缓存
rm -rf .nuxt .output
```

### Q2: TypeScript 类型错误

**问题描述：**
```
Property 'user' does not exist on type 'AuthState'
```

**解决方案：**
```bash
# 1. 重新生成类型
pnpm run build

# 2. 重启 TypeScript 服务器（VS Code）
Ctrl/Cmd + Shift + P -> "TypeScript: Restart TS Server"

# 3. 检查类型定义文件是否正确导入
```

## 🔐 认证相关问题

### Q3: Supabase 认证不工作

**问题描述：**
用户登录后立即被重定向到登录页面。

**解决方案：**
```typescript
// 1. 检查环境变量
console.log(process.env.SUPABASE_URL)
console.log(process.env.SUPABASE_ANON_KEY)

// 2. 检查 Supabase 项目设置
// Dashboard > Authentication > Settings
// 确保 Site URL 和 Redirect URLs 正确配置

// 3. 检查认证中间件
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 添加调试日志
  console.log('Auth middleware:', authStore.isAuthenticated)
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
```

### Q4: 用户刷新页面后丢失登录状态

**问题描述：**
页面刷新后用户需要重新登录。

**解决方案：**
```typescript
// plugins/init.client.ts
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // 确保在客户端初始化时恢复认证状态
  await authStore.initialize()
})

// stores/auth.ts
const initialize = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      }
    }
  } catch (error) {
    console.error('初始化认证状态失败:', error)
  }
}
```

## 📊 数据库相关问题

### Q5: RLS 策略导致数据无法访问

**问题描述：**
```
new row violates row-level security policy for table "todos"
```

**解决方案：**
```sql
-- 1. 检查 RLS 策略是否正确
SELECT * FROM pg_policies WHERE tablename = 'todos';

-- 2. 确保策略允许当前操作
-- 检查 INSERT 策略
CREATE POLICY "todos_insert_policy" ON todos
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. 临时禁用 RLS 进行调试（仅开发环境）
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
-- 测试完成后重新启用
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

### Q6: 数据库连接超时

**问题描述：**
```
Error: Connection timeout
```

**解决方案：**
```typescript
// 1. 检查 Supabase 项目状态
// Dashboard > Settings > General
// 确保项目处于活跃状态

// 2. 增加连接超时时间
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
})

// 3. 检查网络连接和防火墙设置
```

## 🎨 UI 和样式问题

### Q7: Tailwind CSS 样式不生效

**问题描述：**
自定义的 Tailwind 类不起作用。

**解决方案：**
```typescript
// 1. 检查 Nuxt 配置
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'], // @nuxt/ui 已包含 Tailwind
  
  // 如果需要自定义配置
  tailwindcss: {
    config: {
      content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
        './app.vue'
      ]
    }
  }
})

// 2. 重启开发服务器
pnpm run dev

// 3. 清理缓存
rm -rf .nuxt
```

### Q8: 深色模式切换不工作

**问题描述：**
主题切换按钮点击后没有效果。

**解决方案：**
```vue
<script setup>
// 确保正确使用 @nuxt/ui 的颜色模式
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button @click="toggleColorMode">
    <Icon 
      :name="colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'" 
    />
  </button>
</template>
```

## 🔄 状态管理问题

### Q9: Pinia store 状态不更新

**问题描述：**
修改 store 状态后组件没有重新渲染。

**解决方案：**
```typescript
// ❌ 错误做法：直接修改状态
const todosStore = useTodosStore()
todosStore.todos.push(newTodo) // 可能不会触发响应式更新

// ✅ 正确做法：通过 actions 修改
const todosStore = useTodosStore()
await todosStore.addTodo(newTodo)

// 或者在组件中使用 storeToRefs
const { todos, loading } = storeToRefs(todosStore)
```

### Q10: SSR 和客户端状态不一致

**问题描述：**
```
Hydration mismatch: server and client render different content
```

**解决方案：**
```typescript
// 1. 使用 ClientOnly 组件包装客户端特定内容
<template>
  <div>
    <ServerSafeContent />
    <ClientOnly>
      <ClientSpecificContent />
    </ClientOnly>
  </div>
</template>

// 2. 在 store 中正确处理 SSR
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  
  // 只在客户端执行
  onMounted(() => {
    if (process.client) {
      initializeAuth()
    }
  })
})
```

## 🚀 性能问题

### Q11: 页面加载缓慢

**问题描述：**
首次加载或页面切换很慢。

**解决方案：**
```typescript
// 1. 使用懒加载
const TodoChart = defineAsyncComponent(() => import('~/components/TodoChart.vue'))

// 2. 优化数据获取
const { data: todos } = await useLazyFetch('/api/todos', {
  default: () => []
})

// 3. 启用预渲染
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})

// 4. 使用路由规则
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/auth/**': { ssr: false }
  }
})
```

### Q12: 内存泄漏问题

**问题描述：**
长时间使用后应用变慢。

**解决方案：**
```typescript
// 1. 正确清理事件监听器
onMounted(() => {
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

// 2. 清理定时器
const timer = setInterval(() => { /* ... */ }, 1000)

onUnmounted(() => {
  clearInterval(timer)
})

// 3. 取消未完成的请求
const controller = new AbortController()

const fetchData = async () => {
  try {
    await $fetch('/api/data', {
      signal: controller.signal
    })
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(error)
    }
  }
}

onUnmounted(() => {
  controller.abort()
})
```

## 🔧 开发工具问题

### Q13: VS Code 智能提示不工作

**问题描述：**
TypeScript 智能提示和自动完成不工作。

**解决方案：**
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "vue.codeActions.enabled": true,
  "vue.complete.casing.tags": "kebab",
  "vue.complete.casing.props": "camel"
}

// 安装推荐扩展
// - Vue Language Features (Volar)
// - TypeScript Vue Plugin (Volar)
// - Nuxt
```

### Q14: 热重载不工作

**问题描述：**
修改代码后页面不自动刷新。

**解决方案：**
```typescript
// 1. 检查开发服务器配置
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  vite: {
    server: {
      hmr: {
        port: 24678
      }
    }
  }
})

// 2. 检查文件监听
// 确保文件不在 .gitignore 中
// 检查文件系统权限

// 3. 重启开发服务器
pnpm run dev
```

## 📱 部署问题

### Q15: 生产环境构建失败

**问题描述：**
```
Build failed with errors
```

**解决方案：**
```bash
# 1. 检查 TypeScript 错误
pnpm run build

# 2. 检查环境变量
# 确保生产环境变量正确设置

# 3. 清理缓存后重新构建
rm -rf .nuxt .output node_modules
pnpm install
pnpm run build

# 4. 检查依赖版本兼容性
pnpm audit
```

## 🆘 获取帮助

如果以上解决方案都不能解决您的问题，可以：

1. **查看官方文档**
   - [Nuxt.js 文档](https://nuxt.com/docs)
   - [Supabase 文档](https://supabase.com/docs)
   - [Pinia 文档](https://pinia.vuejs.org/)

2. **社区支持**
   - [Nuxt Discord](https://discord.com/invite/ps2h6QT)
   - [Vue.js Discord](https://discord.com/invite/vue)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/nuxt.js)

3. **GitHub Issues**
   - [Nuxt Issues](https://github.com/nuxt/nuxt/issues)
   - [Supabase Issues](https://github.com/supabase/supabase/issues)

4. **创建最小复现示例**
   - 使用 [StackBlitz](https://stackblitz.com/) 创建在线示例
   - 提供详细的错误信息和步骤

记住，在寻求帮助时，提供详细的错误信息、环境信息和复现步骤会大大提高获得有效帮助的几率。
