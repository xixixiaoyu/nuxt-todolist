<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 设置页面标题
useHead({
  title: 'TodoList - 高效的待办事项管理',
  meta: [
    { name: 'description', content: '一个现代化的待办事项管理应用，帮助您高效管理日常任务。' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>
