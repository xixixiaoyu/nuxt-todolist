<template>
  <div class="todo-card" :class="{ 'todo-completed': todo.completed }">
    <div class="flex items-start space-x-3">
      <!-- 完成状态复选框 -->
      <button
        @click="$emit('toggle', todo)"
        class="flex-shrink-0 mt-1"
      >
        <Icon
          :name="todo.completed ? 'lucide:check-circle-2' : 'lucide:circle'"
          :class="[
            'h-5 w-5 transition-colors duration-200',
            todo.completed 
              ? 'text-green-600' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          ]"
        />
      </button>

      <!-- Todo 内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- 标题 -->
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ todo.title }}
            </h3>
            
            <!-- 描述 -->
            <p v-if="todo.description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ todo.description }}
            </p>

            <!-- 元信息 -->
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <!-- 分类 -->
              <span
                v-if="todo.category"
                class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                <Icon name="lucide:tag" class="h-3 w-3 mr-1" />
                {{ todo.category }}
              </span>

              <!-- 优先级 -->
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityClasses(todo.priority)
                ]"
              >
                <Icon :name="getPriorityIcon(todo.priority)" class="h-3 w-3 mr-1" />
                {{ getPriorityLabel(todo.priority) }}
              </span>

              <!-- 截止日期 -->
              <span
                v-if="todo.due_date"
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs',
                  isOverdue(todo.due_date) && !todo.completed
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                ]"
              >
                <Icon name="lucide:calendar" class="h-3 w-3 mr-1" />
                {{ formatDate(todo.due_date) }}
              </span>

              <!-- 创建时间 -->
              <span class="text-gray-500 dark:text-gray-400">
                {{ formatRelativeTime(todo.created_at) }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="$emit('edit', todo)"
              class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="编辑"
            >
              <Icon name="lucide:edit-3" class="h-4 w-4" />
            </button>
            
            <button
              @click="$emit('delete', todo)"
              class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              title="删除"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo, Priority } from '~/types'

defineProps<{
  todo: Todo
}>()

defineEmits<{
  'toggle': [todo: Todo]
  'edit': [todo: Todo]
  'delete': [todo: Todo]
}>()

const getPriorityClasses = (priority: Priority) => {
  const classes = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  }
  return classes[priority]
}

const getPriorityIcon = (priority: Priority) => {
  const icons = {
    low: 'lucide:arrow-down',
    medium: 'lucide:minus',
    high: 'lucide:arrow-up'
  }
  return icons[priority]
}

const getPriorityLabel = (priority: Priority) => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority]
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays === -1) {
    return '昨天'
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays}天后`
  } else if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>
