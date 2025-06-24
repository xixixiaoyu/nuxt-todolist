<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <div
        :class="[
          'animate-spin rounded-full border-4 border-solid border-current border-r-transparent',
          sizeClass,
          colorClass
        ]"
      />
      <span v-if="text" class="sr-only">{{ text }}</span>
    </div>
    <span v-if="text && showText" :class="['ml-3 text-sm font-medium', textColorClass]">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  showText?: boolean
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  showText: false,
  fullScreen: false
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }
  return colors[props.color]
})

const textColorClass = computed(() => {
  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }
  return colors[props.color]
})

const containerClass = computed(() => {
  return props.fullScreen ? 'min-h-screen' : 'py-4'
})
</script>
