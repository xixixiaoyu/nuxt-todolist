export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 如果用户未认证，重定向到登录页面
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})
