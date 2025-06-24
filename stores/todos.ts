import { defineStore } from 'pinia'
import type { Todo, TodoInsert, TodoUpdate, Category, CategoryInsert, TodoState } from '~/types'

export const useTodosStore = defineStore('todos', () => {
  const { $supabase } = useNuxtApp()
  const authStore = useAuthStore()
  
  // 状态
  const todos = ref<Todo[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const filter = ref<'all' | 'active' | 'completed'>('all')
  const selectedCategory = ref<string | null>(null)
  
  // Getters
  const filteredTodos = computed(() => {
    let filtered = todos.value
    
    // 按完成状态过滤
    if (filter.value === 'active') {
      filtered = filtered.filter(todo => !todo.completed)
    } else if (filter.value === 'completed') {
      filtered = filtered.filter(todo => todo.completed)
    }
    
    // 按分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(todo => todo.category === selectedCategory.value)
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })
  
  const todoStats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(todo => todo.completed).length
    const active = total - completed
    
    return { total, completed, active }
  })
  
  // Actions
  const fetchTodos = async () => {
    if (!authStore.user) return
    
    loading.value = true
    try {
      const { data, error } = await $supabase
        .from('todos')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      todos.value = data || []
    } catch (error: any) {
      console.error('获取 todos 错误:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const fetchCategories = async () => {
    if (!authStore.user) return
    
    try {
      const { data, error } = await $supabase
        .from('categories')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      categories.value = data || []
    } catch (error: any) {
      console.error('获取分类错误:', error.message)
      throw error
    }
  }
  
  const addTodo = async (todoData: Omit<TodoInsert, 'user_id'>) => {
    if (!authStore.user) return
    
    loading.value = true
    try {
      const { data, error } = await $supabase
        .from('todos')
        .insert({
          ...todoData,
          user_id: authStore.user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      todos.value.unshift(data)
      return data
    } catch (error: any) {
      console.error('添加 todo 错误:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const updateTodo = async (id: string, updates: TodoUpdate) => {
    loading.value = true
    try {
      const { data, error } = await $supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = todos.value.findIndex(todo => todo.id === id)
      if (index !== -1) {
        todos.value[index] = data
      }
      
      return data
    } catch (error: any) {
      console.error('更新 todo 错误:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const deleteTodo = async (id: string) => {
    loading.value = true
    try {
      const { error } = await $supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      todos.value = todos.value.filter(todo => todo.id !== id)
    } catch (error: any) {
      console.error('删除 todo 错误:', error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const toggleTodo = async (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return
    
    await updateTodo(id, { completed: !todo.completed })
  }
  
  const addCategory = async (categoryData: Omit<CategoryInsert, 'user_id'>) => {
    if (!authStore.user) return
    
    try {
      const { data, error } = await $supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: authStore.user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      categories.value.unshift(data)
      return data
    } catch (error: any) {
      console.error('添加分类错误:', error.message)
      throw error
    }
  }
  
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await $supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      categories.value = categories.value.filter(cat => cat.id !== id)
    } catch (error: any) {
      console.error('删除分类错误:', error.message)
      throw error
    }
  }
  
  const setFilter = (newFilter: 'all' | 'active' | 'completed') => {
    filter.value = newFilter
  }
  
  const setSelectedCategory = (categoryId: string | null) => {
    selectedCategory.value = categoryId
  }
  
  const clearCompleted = async () => {
    const completedTodos = todos.value.filter(todo => todo.completed)
    
    loading.value = true
    try {
      for (const todo of completedTodos) {
        await deleteTodo(todo.id)
      }
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    todos: readonly(todos),
    categories: readonly(categories),
    loading: readonly(loading),
    filter: readonly(filter),
    selectedCategory: readonly(selectedCategory),
    
    // Getters
    filteredTodos,
    todoStats,
    
    // Actions
    fetchTodos,
    fetchCategories,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addCategory,
    deleteCategory,
    setFilter,
    setSelectedCategory,
    clearCompleted
  }
})
