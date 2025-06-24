/**
 * 响应式断点工具函数
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof breakpoints

/**
 * 检查当前屏幕宽度是否大于等于指定断点
 */
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const isLargerOrEqual = ref(false)

  const checkBreakpoint = () => {
    if (process.client) {
      isLargerOrEqual.value = window.innerWidth >= breakpoints[breakpoint]
    }
  }

  onMounted(() => {
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', checkBreakpoint)
    }
  })

  return isLargerOrEqual
}

/**
 * 获取当前屏幕尺寸类别
 */
export const useScreenSize = () => {
  const screenSize = ref<Breakpoint>('sm')

  const updateScreenSize = () => {
    if (process.client) {
      const width = window.innerWidth
      
      if (width >= breakpoints['2xl']) {
        screenSize.value = '2xl'
      } else if (width >= breakpoints.xl) {
        screenSize.value = 'xl'
      } else if (width >= breakpoints.lg) {
        screenSize.value = 'lg'
      } else if (width >= breakpoints.md) {
        screenSize.value = 'md'
      } else {
        screenSize.value = 'sm'
      }
    }
  }

  onMounted(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', updateScreenSize)
    }
  })

  return {
    screenSize: readonly(screenSize),
    isMobile: computed(() => screenSize.value === 'sm'),
    isTablet: computed(() => screenSize.value === 'md'),
    isDesktop: computed(() => ['lg', 'xl', '2xl'].includes(screenSize.value))
  }
}

/**
 * 移动端检测
 */
export const useIsMobile = () => {
  return useBreakpoint('md').value === false
}

/**
 * 触摸设备检测
 */
export const useIsTouchDevice = () => {
  const isTouchDevice = ref(false)

  onMounted(() => {
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  return readonly(isTouchDevice)
}
