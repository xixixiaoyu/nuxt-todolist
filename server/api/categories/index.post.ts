import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  try {
    // 从请求头获取认证信息
    const authorization = getHeader(event, 'authorization')
    if (!authorization) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 设置认证头
    supabase.auth.setSession({
      access_token: authorization.replace('Bearer ', ''),
      refresh_token: ''
    })

    const body = await readBody(event)
    
    // 验证必需字段
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category name is required'
      })
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(body)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})
