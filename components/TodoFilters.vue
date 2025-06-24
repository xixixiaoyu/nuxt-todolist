<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <!-- 状态过滤器 -->
      <div class="flex space-x-1">
        <button
          v-for="filterOption in filterOptions"
          :key="filterOption.value"
          @click="todosStore.setFilter(filterOption.value)"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
            todosStore.filter === filterOption.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ filterOption.label }}
        </button>
      </div>

      <!-- 分类过滤器 -->
      <div class="flex items-center space-x-4">
        <select
          :value="todosStore.selectedCategory"
          @change="handleCategoryChange"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">所有分类</option>
          <option v-for="category in todosStore.categories" :key="category.id" :value="category.name">
            {{ category.name }}
          </option>
        </select>

        <!-- 清除已完成 -->
        <button
          v-if="todosStore.todoStats.completed > 0"
          @click="clearCompleted"
          class="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
        >
          清除已完成 ({{ todosStore.todoStats.completed }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const todosStore = useTodosStore()

const filterOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'active' as const, label: '进行中' },
  { value: 'completed' as const, label: '已完成' }
]

const handleCategoryChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  todosStore.setSelectedCategory(target.value || null)
}

const clearCompleted = async () => {
  if (confirm('确定要删除所有已完成的待办事项吗？')) {
    await todosStore.clearCompleted()
  }
}
</script>
