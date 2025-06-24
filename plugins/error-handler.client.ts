export default defineNuxtPlugin(() => {
  // 全局错误处理
  const handleError = (error: any, context?: string) => {
    console.error(`[${context || 'Global'}] Error:`, error)
    
    // 这里可以添加错误上报逻辑
    // 例如发送到错误监控服务
    
    // 显示用户友好的错误消息
    const toast = useToast()
    
    let message = '发生了未知错误'
    
    if (error?.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    
    toast.add({
      title: '错误',
      description: message,
      color: 'red',
      timeout: 5000
    })
  }

  // 监听未捕获的错误
  window.addEventListener('error', (event) => {
    handleError(event.error, 'Window Error')
  })

  // 监听未捕获的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Unhandled Promise Rejection')
  })

  return {
    provide: {
      handleError
    }
  }
})
