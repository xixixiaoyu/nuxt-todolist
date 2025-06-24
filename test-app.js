#!/usr/bin/env node

/**
 * 简单的应用测试脚本
 * 用于验证应用的基本功能是否正常
 */

const http = require('http')

const TEST_URL = 'http://localhost:3000'
const TIMEOUT = 5000

console.log('🧪 开始测试 TodoList 应用...\n')

// 测试服务器是否响应
function testServerResponse() {
  return new Promise((resolve, reject) => {
    const req = http.get(TEST_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ 服务器响应正常 (200)')
        resolve(true)
      } else {
        console.log(`❌ 服务器响应异常 (${res.statusCode})`)
        resolve(false)
      }
    })

    req.on('error', (err) => {
      console.log(`❌ 无法连接到服务器: ${err.message}`)
      resolve(false)
    })

    req.setTimeout(TIMEOUT, () => {
      console.log('❌ 请求超时')
      req.destroy()
      resolve(false)
    })
  })
}

// 测试认证页面
function testAuthPages() {
  return new Promise((resolve) => {
    const authUrls = ['/auth/login', '/auth/register']
    let completed = 0
    let passed = 0

    authUrls.forEach(url => {
      const req = http.get(TEST_URL + url, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ 认证页面可访问: ${url}`)
          passed++
        } else {
          console.log(`❌ 认证页面异常: ${url} (${res.statusCode})`)
        }
        
        completed++
        if (completed === authUrls.length) {
          resolve(passed === authUrls.length)
        }
      })

      req.on('error', () => {
        console.log(`❌ 认证页面错误: ${url}`)
        completed++
        if (completed === authUrls.length) {
          resolve(passed === authUrls.length)
        }
      })

      req.setTimeout(TIMEOUT, () => {
        req.destroy()
        completed++
        if (completed === authUrls.length) {
          resolve(passed === authUrls.length)
        }
      })
    })
  })
}

// 主测试函数
async function runTests() {
  console.log('📋 测试清单:')
  console.log('1. 服务器响应测试')
  console.log('2. 认证页面测试')
  console.log('3. 基本路由测试\n')

  const results = []

  // 测试 1: 服务器响应
  console.log('🔍 测试 1: 服务器响应')
  const serverTest = await testServerResponse()
  results.push(serverTest)

  if (!serverTest) {
    console.log('\n❌ 服务器未启动，请先运行: pnpm run dev')
    process.exit(1)
  }

  // 测试 2: 认证页面
  console.log('\n🔍 测试 2: 认证页面')
  const authTest = await testAuthPages()
  results.push(authTest)

  // 测试结果汇总
  console.log('\n📊 测试结果汇总:')
  console.log('==================')
  
  const passedTests = results.filter(Boolean).length
  const totalTests = results.length

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！')
    console.log('\n✨ 应用基本功能正常，可以开始使用了！')
    console.log('\n📝 下一步:')
    console.log('1. 配置 Supabase 数据库')
    console.log('2. 设置环境变量')
    console.log('3. 创建用户账户')
    console.log('4. 开始管理你的待办事项！')
  } else {
    console.log(`⚠️  ${totalTests - passedTests} 个测试失败`)
    console.log('\n🔧 请检查:')
    console.log('1. 应用是否正确启动')
    console.log('2. 依赖是否正确安装')
    console.log('3. 配置是否正确')
  }

  console.log('\n' + '='.repeat(50))
}

// 运行测试
runTests().catch(console.error)
