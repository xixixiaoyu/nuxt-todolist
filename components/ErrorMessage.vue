<template>
  <div
    v-if="message"
    :class="[
      'rounded-lg p-4 border',
      typeClasses[type]
    ]"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <Icon :name="iconName" :class="['h-5 w-5', iconClasses[type]]" />
      </div>
      <div class="ml-3 flex-1">
        <h3 v-if="title" :class="['text-sm font-medium', titleClasses[type]]">
          {{ title }}
        </h3>
        <div :class="['text-sm', messageClasses[type], title ? 'mt-1' : '']">
          {{ message }}
        </div>
        <div v-if="$slots.actions" class="mt-3">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          @click="$emit('dismiss')"
          :class="['inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2', dismissClasses[type]]"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'error' | 'warning' | 'success' | 'info'
  title?: string
  message: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  dismissible: false
})

defineEmits<{
  dismiss: []
}>()

const iconName = computed(() => {
  const icons = {
    error: 'lucide:alert-circle',
    warning: 'lucide:alert-triangle',
    success: 'lucide:check-circle',
    info: 'lucide:info'
  }
  return icons[props.type]
})

const typeClasses = {
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
}

const iconClasses = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  success: 'text-green-400',
  info: 'text-blue-400'
}

const titleClasses = {
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-yellow-800 dark:text-yellow-200',
  success: 'text-green-800 dark:text-green-200',
  info: 'text-blue-800 dark:text-blue-200'
}

const messageClasses = {
  error: 'text-red-700 dark:text-red-300',
  warning: 'text-yellow-700 dark:text-yellow-300',
  success: 'text-green-700 dark:text-green-300',
  info: 'text-blue-700 dark:text-blue-300'
}

const dismissClasses = {
  error: 'text-red-400 hover:text-red-600 focus:ring-red-500',
  warning: 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500',
  success: 'text-green-400 hover:text-green-600 focus:ring-green-500',
  info: 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
}
</script>
