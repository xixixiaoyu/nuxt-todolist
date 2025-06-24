<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader />
    
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题和统计 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          我的待办事项
        </h1>
        <TodoStats />
      </div>

      <!-- 添加新 Todo -->
      <div class="mb-8">
        <TodoForm />
      </div>

      <!-- 过滤器和分类选择 -->
      <div class="mb-6">
        <TodoFilters />
      </div>

      <!-- Todo 列表 -->
      <div class="space-y-4">
        <TodoList />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const todosStore = useTodosStore()

// 页面加载时获取数据
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      todosStore.fetchTodos(),
      todosStore.fetchCategories()
    ])
  }
})

// 监听认证状态变化
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await Promise.all([
      todosStore.fetchTodos(),
      todosStore.fetchCategories()
    ])
  }
})
</script>
