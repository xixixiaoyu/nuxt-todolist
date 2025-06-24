<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <Icon name="lucide:list" class="h-8 w-8 text-blue-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            总计
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ todosStore.todoStats.total }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <Icon name="lucide:clock" class="h-8 w-8 text-yellow-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            进行中
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ todosStore.todoStats.active }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <Icon name="lucide:check-circle" class="h-8 w-8 text-green-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            已完成
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ todosStore.todoStats.completed }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const todosStore = useTodosStore()
</script>
