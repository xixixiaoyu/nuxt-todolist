<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <Icon name="lucide:check-square" class="h-8 w-8 text-blue-600" />
          <h1 class="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            TodoList
          </h1>
        </div>

        <!-- 用户菜单 -->
        <div class="flex items-center space-x-4">
          <!-- 主题切换 -->
          <button
            @click="toggleColorMode"
            class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Icon 
              :name="$colorMode.value === 'dark' ? 'lucide:sun' : 'lucide:moon'" 
              class="h-5 w-5" 
            />
          </button>

          <!-- 用户信息 -->
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ authStore.user?.email }}
            </span>
            
            <UDropdown :items="userMenuItems">
              <UButton
                color="gray"
                variant="ghost"
                trailing-icon="i-heroicons-chevron-down-20-solid"
              >
                <Icon name="lucide:user" class="h-5 w-5" />
              </UButton>
            </UDropdown>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const userMenuItems = [
  [{
    label: '登出',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => authStore.signOut()
  }]
]
</script>
