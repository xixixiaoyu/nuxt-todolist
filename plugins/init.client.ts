export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // 初始化认证状态
  await authStore.initialize()
})
