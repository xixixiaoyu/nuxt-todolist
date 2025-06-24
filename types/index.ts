import type { Database } from './database'

export type Todo = Database['public']['Tables']['todos']['Row']
export type TodoInsert = Database['public']['Tables']['todos']['Insert']
export type TodoUpdate = Database['public']['Tables']['todos']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface TodoState {
  todos: Todo[]
  categories: Category[]
  loading: boolean
  filter: 'all' | 'active' | 'completed'
  selectedCategory: string | null
}

export type Priority = 'low' | 'medium' | 'high'

export interface TodoForm {
  title: string
  description: string
  category: string
  priority: Priority
  due_date: string | null
}
