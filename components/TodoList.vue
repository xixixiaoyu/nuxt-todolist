<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="todosStore.loading" class="flex justify-center py-8">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="todosStore.filteredTodos.length === 0" class="text-center py-12">
      <Icon name="lucide:clipboard-list" class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ getEmptyStateMessage() }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        {{ getEmptyStateDescription() }}
      </p>
    </div>

    <!-- Todo 列表 -->
    <div v-else class="space-y-3">
      <TodoItem
        v-for="todo in todosStore.filteredTodos"
        :key="todo.id"
        :todo="todo"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle="handleToggle"
      />
    </div>

    <!-- 编辑模态框 -->
    <UModal v-model="showEditModal">
      <div class="p-6">
        <TodoForm
          :editing-todo="editingTodo"
          @todo-saved="handleTodoSaved"
          @cancel-edit="handleCancelEdit"
        />
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types'

const todosStore = useTodosStore()

const showEditModal = ref(false)
const editingTodo = ref<Todo | null>(null)

const getEmptyStateMessage = () => {
  if (todosStore.filter === 'active') {
    return '没有进行中的待办事项'
  } else if (todosStore.filter === 'completed') {
    return '没有已完成的待办事项'
  } else if (todosStore.selectedCategory) {
    return `"${todosStore.selectedCategory}" 分类下没有待办事项`
  } else {
    return '还没有待办事项'
  }
}

const getEmptyStateDescription = () => {
  if (todosStore.filter === 'active') {
    return '所有待办事项都已完成！'
  } else if (todosStore.filter === 'completed') {
    return '完成一些待办事项后，它们会显示在这里。'
  } else if (todosStore.selectedCategory) {
    return '在这个分类下添加一些待办事项吧。'
  } else {
    return '添加您的第一个待办事项开始使用吧！'
  }
}

const handleEdit = (todo: Todo) => {
  editingTodo.value = todo
  showEditModal.value = true
}

const handleDelete = async (todo: Todo) => {
  if (confirm('确定要删除这个待办事项吗？')) {
    await todosStore.deleteTodo(todo.id)
  }
}

const handleToggle = async (todo: Todo) => {
  await todosStore.toggleTodo(todo.id)
}

const handleTodoSaved = () => {
  showEditModal.value = false
  editingTodo.value = null
}

const handleCancelEdit = () => {
  showEditModal.value = false
  editingTodo.value = null
}
</script>
