<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ editingTodo ? '编辑待办事项' : '添加新的待办事项' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 标题 -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          标题 *
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          :class="[
            'input-field',
            hasFieldError('title') ? 'border-red-500 focus:ring-red-500' : '',
          ]"
          placeholder="输入待办事项标题..."
          @blur="validateField('title')"
        />
        <p v-if="hasFieldError('title')" class="mt-1 text-sm text-red-600">
          {{ getFieldError('title') }}
        </p>
      </div>

      <!-- 描述 -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          描述
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          :class="[
            'input-field',
            hasFieldError('description') ? 'border-red-500 focus:ring-red-500' : '',
          ]"
          placeholder="输入详细描述..."
          @blur="validateField('description')"
        />
        <p v-if="hasFieldError('description')" class="mt-1 text-sm text-red-600">
          {{ getFieldError('description') }}
        </p>
      </div>

      <!-- 分类和优先级 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="category"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            分类
          </label>
          <select id="category" v-model="form.category" class="input-field">
            <option value="">选择分类</option>
            <option
              v-for="category in todosStore.categories"
              :key="category.id"
              :value="category.name"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="priority"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            优先级
          </label>
          <select id="priority" v-model="form.priority" class="input-field">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>

      <!-- 截止日期 -->
      <div>
        <label
          for="due_date"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          截止日期
        </label>
        <input id="due_date" v-model="form.due_date" type="datetime-local" class="input-field" />
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- 按钮 -->
      <div class="flex justify-end space-x-3">
        <button v-if="editingTodo" type="button" @click="cancelEdit" class="btn-secondary">
          取消
        </button>

        <button
          type="submit"
          :disabled="loading || !isValid || !form.title.trim()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="loading" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
          {{ editingTodo ? '更新' : '添加' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Todo, TodoForm } from '~/types'

const todosStore = useTodosStore()

const props = defineProps<{
  editingTodo?: Todo | null
}>()

const emit = defineEmits<{
  'todo-saved': []
  'cancel-edit': []
}>()

const form = ref<TodoForm>({
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  due_date: null,
})

const loading = ref(false)
const error = ref('')

// 表单验证
const validationRules = {
  title: commonRules.todoTitle,
  description: commonRules.todoDescription,
  category: { maxLength: 50 },
  priority: { required: false },
  due_date: { required: false },
}

const { errors, isValid, validate, validateField, clearErrors, getFieldError, hasFieldError } =
  useFormValidation(form, validationRules)

// 监听编辑状态变化
watch(
  () => props.editingTodo,
  (todo) => {
    if (todo) {
      form.value.title = todo.title
      form.value.description = todo.description || ''
      form.value.category = todo.category || ''
      form.value.priority = todo.priority
      form.value.due_date = todo.due_date
        ? new Date(todo.due_date).toISOString().slice(0, 16)
        : null
    } else {
      resetForm()
    }
    clearErrors()
  },
  { immediate: true }
)

const resetForm = () => {
  form.value.title = ''
  form.value.description = ''
  form.value.category = ''
  form.value.priority = 'medium'
  form.value.due_date = null
  error.value = ''
  clearErrors()
}

const handleSubmit = async () => {
  // 验证表单
  if (!validate()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const todoData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || null,
      category: form.value.category || null,
      priority: form.value.priority,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
    }

    if (props.editingTodo) {
      await todosStore.updateTodo(props.editingTodo.id, todoData)
    } else {
      await todosStore.addTodo(todoData)
    }

    emit('todo-saved')
    if (!props.editingTodo) {
      resetForm()
    }
  } catch (err: any) {
    error.value = err.message || '操作失败'
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  emit('cancel-edit')
  resetForm()
}
</script>
