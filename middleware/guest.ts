export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // 如果用户已认证，重定向到主页
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
