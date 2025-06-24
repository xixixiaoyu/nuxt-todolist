/**
 * 表单验证工具函数
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 验证单个字段
 */
export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = []

  // 必填验证
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    errors.push('此字段为必填项')
    return { isValid: false, errors }
  }

  // 如果值为空且不是必填，则跳过其他验证
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: true, errors: [] }
  }

  // 最小长度验证
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`最少需要 ${rules.minLength} 个字符`)
  }

  // 最大长度验证
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`最多允许 ${rules.maxLength} 个字符`)
  }

  // 正则表达式验证
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('格式不正确')
  }

  // 自定义验证
  if (rules.custom) {
    const result = rules.custom(value)
    if (result !== true) {
      errors.push(typeof result === 'string' ? result : '验证失败')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 验证表单对象
 */
export const validateForm = (
  formData: Record<string, any>,
  rules: Record<string, ValidationRule>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    results[field] = validateField(formData[field], fieldRules)
  }

  return results
}

/**
 * 检查表单是否有效
 */
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid)
}

/**
 * 常用验证规则
 */
export const commonRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!value) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '请输入有效的邮箱地址'
    }
  },
  password: {
    minLength: 6,
    custom: (value: string) => {
      if (!value) return true
      if (value.length < 6) return '密码至少需要6位'
      return true
    }
  },
  required: {
    required: true
  },
  todoTitle: {
    required: true,
    minLength: 1,
    maxLength: 200,
    custom: (value: string) => {
      if (!value || !value.trim()) return '请输入待办事项标题'
      if (value.trim().length > 200) return '标题不能超过200个字符'
      return true
    }
  },
  todoDescription: {
    maxLength: 1000,
    custom: (value: string) => {
      if (value && value.length > 1000) return '描述不能超过1000个字符'
      return true
    }
  },
  categoryName: {
    required: true,
    minLength: 1,
    maxLength: 50,
    custom: (value: string) => {
      if (!value || !value.trim()) return '请输入分类名称'
      if (value.trim().length > 50) return '分类名称不能超过50个字符'
      return true
    }
  }
}

/**
 * 表单验证 Composable
 */
export const useFormValidation = <T extends Record<string, any>>(
  formData: Ref<T>,
  rules: Record<keyof T, ValidationRule>
) => {
  const errors = ref<Record<keyof T, string[]>>({} as Record<keyof T, string[]>)
  const isValid = ref(true)

  const validate = () => {
    const results = validateForm(formData.value, rules)
    
    // 更新错误信息
    for (const [field, result] of Object.entries(results)) {
      errors.value[field as keyof T] = result.errors
    }

    // 更新整体有效性
    isValid.value = isFormValid(results)

    return isValid.value
  }

  const validateField = (field: keyof T) => {
    const result = validateField(formData.value[field], rules[field])
    errors.value[field] = result.errors
    
    // 重新计算整体有效性
    isValid.value = Object.values(errors.value).every(fieldErrors => fieldErrors.length === 0)
    
    return result.isValid
  }

  const clearErrors = () => {
    errors.value = {} as Record<keyof T, string[]>
    isValid.value = true
  }

  const getFieldError = (field: keyof T): string | null => {
    const fieldErrors = errors.value[field]
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null
  }

  const hasFieldError = (field: keyof T): boolean => {
    const fieldErrors = errors.value[field]
    return fieldErrors && fieldErrors.length > 0
  }

  return {
    errors: readonly(errors),
    isValid: readonly(isValid),
    validate,
    validateField,
    clearErrors,
    getFieldError,
    hasFieldError
  }
}
