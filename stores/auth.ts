import { defineStore } from 'pinia'
import type { User, AuthState } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const { $supabase } = useNuxtApp()
  
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!user.value)
  
  // Actions
  const signUp = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await $supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        }
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('注册错误:', error.message)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }
  
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        }
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('登录错误:', error.message)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }
  
  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await $supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      await navigateTo('/auth/login')
      
      return { error: null }
    } catch (error: any) {
      console.error('登出错误:', error.message)
      return { error }
    } finally {
      loading.value = false
    }
  }
  
  const getCurrentUser = async () => {
    try {
      const { data: { user: currentUser } } = await $supabase.auth.getUser()
      
      if (currentUser) {
        user.value = {
          id: currentUser.id,
          email: currentUser.email!,
          created_at: currentUser.created_at
        }
      }
      
      return currentUser
    } catch (error: any) {
      console.error('获取用户信息错误:', error.message)
      return null
    }
  }
  
  const initialize = async () => {
    loading.value = true
    try {
      await getCurrentUser()
      
      // 监听认证状态变化
      $supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          user.value = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          }
        } else {
          user.value = null
        }
      })
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    user: readonly(user),
    loading: readonly(loading),
    
    // Getters
    isAuthenticated,
    
    // Actions
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    initialize
  }
})
