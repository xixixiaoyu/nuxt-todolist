# 附录 D: 扩展功能建议

本文档提供了基于当前 TodoList 应用的扩展功能建议，帮助您进一步完善和增强应用功能。

## 🎯 基础功能扩展

### 1. 高级搜索和过滤

**功能描述：**
增强搜索功能，支持多条件过滤和高级搜索语法。

**实现建议：**
```typescript
// types/search.ts
export interface SearchFilters {
  query: string
  priority: Priority[]
  categories: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  status: ('completed' | 'active' | 'overdue')[]
  tags: string[]
}

// composables/useAdvancedSearch.ts
export function useAdvancedSearch() {
  const filters = ref<SearchFilters>({
    query: '',
    priority: [],
    categories: [],
    dateRange: { start: null, end: null },
    status: [],
    tags: []
  })

  const searchTodos = computed(() => {
    // 实现复杂搜索逻辑
    return todos.value.filter(todo => {
      // 文本搜索
      if (filters.value.query) {
        const query = filters.value.query.toLowerCase()
        if (!todo.title.toLowerCase().includes(query) && 
            !todo.description?.toLowerCase().includes(query)) {
          return false
        }
      }

      // 优先级过滤
      if (filters.value.priority.length > 0) {
        if (!filters.value.priority.includes(todo.priority)) {
          return false
        }
      }

      // 日期范围过滤
      if (filters.value.dateRange.start || filters.value.dateRange.end) {
        const todoDate = new Date(todo.created_at)
        if (filters.value.dateRange.start && todoDate < filters.value.dateRange.start) {
          return false
        }
        if (filters.value.dateRange.end && todoDate > filters.value.dateRange.end) {
          return false
        }
      }

      return true
    })
  })

  return { filters, searchTodos }
}
```

### 2. 标签系统

**功能描述：**
为 Todo 添加标签功能，支持多标签管理和标签过滤。

**数据库扩展：**
```sql
-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 30),
  color TEXT NOT NULL DEFAULT '#6B7280',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(name, user_id)
);

-- 创建 Todo-标签关联表
CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);

-- 启用 RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "tags_policy" ON tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "todo_tags_policy" ON todo_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM todos 
    WHERE todos.id = todo_tags.todo_id 
    AND todos.user_id = auth.uid()
  )
);
```

**组件实现：**
```vue
<!-- components/TagInput.vue -->
<template>
  <div class="tag-input">
    <div class="selected-tags">
      <span 
        v-for="tag in selectedTags" 
        :key="tag.id"
        class="tag"
        :style="{ backgroundColor: tag.color }"
      >
        {{ tag.name }}
        <button @click="removeTag(tag.id)">×</button>
      </span>
    </div>
    
    <input
      v-model="inputValue"
      @keydown.enter="addTag"
      @keydown.comma="addTag"
      placeholder="添加标签..."
      class="tag-input-field"
    />
    
    <div v-if="suggestions.length > 0" class="tag-suggestions">
      <button
        v-for="tag in suggestions"
        :key="tag.id"
        @click="selectTag(tag)"
        class="tag-suggestion"
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: Tag[]
  availableTags: Tag[]
}

interface Emits {
  'update:modelValue': [tags: Tag[]]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputValue = ref('')
const selectedTags = computed(() => props.modelValue)

const suggestions = computed(() => {
  if (!inputValue.value) return []
  
  return props.availableTags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.value.toLowerCase()) &&
    !selectedTags.value.some(selected => selected.id === tag.id)
  )
})

const addTag = () => {
  const tagName = inputValue.value.trim()
  if (!tagName) return

  // 创建新标签或选择现有标签
  const existingTag = props.availableTags.find(tag => 
    tag.name.toLowerCase() === tagName.toLowerCase()
  )

  if (existingTag) {
    selectTag(existingTag)
  } else {
    // 创建新标签
    createNewTag(tagName)
  }

  inputValue.value = ''
}

const selectTag = (tag: Tag) => {
  if (!selectedTags.value.some(selected => selected.id === tag.id)) {
    emit('update:modelValue', [...selectedTags.value, tag])
  }
}

const removeTag = (tagId: string) => {
  emit('update:modelValue', selectedTags.value.filter(tag => tag.id !== tagId))
}

const createNewTag = async (name: string) => {
  const tagsStore = useTagsStore()
  const newTag = await tagsStore.createTag({ name, color: '#6B7280' })
  if (newTag) {
    selectTag(newTag)
  }
}
</script>
```

### 3. 子任务功能

**功能描述：**
支持为 Todo 添加子任务，实现任务的层级管理。

**数据库扩展：**
```sql
-- 为 todos 表添加父任务字段
ALTER TABLE todos ADD COLUMN parent_id UUID REFERENCES todos(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);

-- 创建递归查询函数
CREATE OR REPLACE FUNCTION get_todo_with_subtasks(todo_uuid UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  completed BOOLEAN,
  parent_id UUID,
  level INTEGER,
  path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE todo_tree AS (
    -- 根节点
    SELECT 
      t.id,
      t.title,
      t.description,
      t.completed,
      t.parent_id,
      0 as level,
      t.id::TEXT as path
    FROM todos t
    WHERE t.id = todo_uuid
    
    UNION ALL
    
    -- 子节点
    SELECT 
      t.id,
      t.title,
      t.description,
      t.completed,
      t.parent_id,
      tt.level + 1,
      tt.path || '/' || t.id::TEXT
    FROM todos t
    INNER JOIN todo_tree tt ON t.parent_id = tt.id
  )
  SELECT * FROM todo_tree ORDER BY path;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 高级功能扩展

### 4. 协作功能

**功能描述：**
支持多用户协作，包括共享 Todo 列表、分配任务、评论等。

**实现要点：**
```typescript
// types/collaboration.ts
export interface SharedTodoList {
  id: string
  name: string
  description: string
  owner_id: string
  created_at: string
  permissions: 'read' | 'write' | 'admin'
}

export interface TodoAssignment {
  todo_id: string
  assigned_to: string
  assigned_by: string
  assigned_at: string
}

export interface TodoComment {
  id: string
  todo_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// 数据库表设计
/*
CREATE TABLE shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE list_members (
  list_id UUID REFERENCES shared_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('read', 'write', 'admin')) DEFAULT 'read',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id)
);

CREATE TABLE todo_assignments (
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (todo_id, assigned_to)
);

CREATE TABLE todo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/
```

### 5. 时间跟踪功能

**功能描述：**
为 Todo 添加时间跟踪功能，记录实际花费时间。

**实现建议：**
```typescript
// types/time-tracking.ts
export interface TimeEntry {
  id: string
  todo_id: string
  user_id: string
  start_time: string
  end_time: string | null
  duration: number // 秒
  description: string
  created_at: string
}

// composables/useTimeTracking.ts
export function useTimeTracking(todoId: string) {
  const currentEntry = ref<TimeEntry | null>(null)
  const isTracking = computed(() => !!currentEntry.value && !currentEntry.value.end_time)
  const elapsedTime = ref(0)

  let timer: NodeJS.Timeout | null = null

  const startTracking = async (description = '') => {
    if (isTracking.value) return

    const entry = await createTimeEntry({
      todo_id: todoId,
      start_time: new Date().toISOString(),
      description
    })

    currentEntry.value = entry
    startTimer()
  }

  const stopTracking = async () => {
    if (!currentEntry.value) return

    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime).getTime() - new Date(currentEntry.value.start_time).getTime()) / 1000)

    await updateTimeEntry(currentEntry.value.id, {
      end_time: endTime,
      duration
    })

    stopTimer()
    currentEntry.value = null
    elapsedTime.value = 0
  }

  const startTimer = () => {
    timer = setInterval(() => {
      if (currentEntry.value) {
        elapsedTime.value = Math.floor((Date.now() - new Date(currentEntry.value.start_time).getTime()) / 1000)
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    stopTimer()
  })

  return {
    isTracking,
    elapsedTime,
    startTracking,
    stopTracking
  }
}
```

### 6. 数据分析和报告

**功能描述：**
提供详细的数据分析和可视化报告。

**实现要点：**
```typescript
// composables/useAnalytics.ts
export function useAnalytics() {
  const getProductivityStats = async (dateRange: { start: Date, end: Date }) => {
    const stats = await $fetch('/api/analytics/productivity', {
      query: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      }
    })

    return {
      completedTodos: stats.completed_count,
      totalTodos: stats.total_count,
      completionRate: stats.completion_rate,
      averageCompletionTime: stats.avg_completion_time,
      productivityTrend: stats.daily_completion_trend,
      categoryBreakdown: stats.category_breakdown,
      priorityDistribution: stats.priority_distribution
    }
  }

  const getTimeSpentAnalysis = async () => {
    const data = await $fetch('/api/analytics/time-spent')
    
    return {
      totalTimeSpent: data.total_time,
      averageTimePerTodo: data.avg_time_per_todo,
      timeByCategory: data.time_by_category,
      timeByPriority: data.time_by_priority,
      dailyTimeSpent: data.daily_time_spent
    }
  }

  return {
    getProductivityStats,
    getTimeSpentAnalysis
  }
}

// components/AnalyticsDashboard.vue
<template>
  <div class="analytics-dashboard">
    <div class="stats-grid">
      <StatCard 
        title="完成率" 
        :value="stats.completionRate" 
        format="percentage" 
      />
      <StatCard 
        title="总任务数" 
        :value="stats.totalTodos" 
      />
      <StatCard 
        title="平均完成时间" 
        :value="stats.averageCompletionTime" 
        format="duration" 
      />
    </div>

    <div class="charts-grid">
      <ChartCard title="完成趋势">
        <LineChart :data="stats.productivityTrend" />
      </ChartCard>
      
      <ChartCard title="分类分布">
        <PieChart :data="stats.categoryBreakdown" />
      </ChartCard>
      
      <ChartCard title="优先级分布">
        <BarChart :data="stats.priorityDistribution" />
      </ChartCard>
    </div>
  </div>
</template>
```

## 📱 移动端和 PWA 扩展

### 7. 渐进式 Web 应用 (PWA)

**功能描述：**
将应用转换为 PWA，支持离线使用和原生应用体验。

**实现步骤：**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    manifest: {
      name: 'TodoList - 高效任务管理',
      short_name: 'TodoList',
      description: '现代化的待办事项管理应用',
      theme_color: '#3B82F6',
      background_color: '#FFFFFF',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
})
```

### 8. 推送通知

**功能描述：**
支持浏览器推送通知，提醒用户重要任务。

**实现建议：**
```typescript
// composables/useNotifications.ts
export function useNotifications() {
  const permission = ref<NotificationPermission>('default')
  
  const requestPermission = async () => {
    if ('Notification' in window) {
      permission.value = await Notification.requestPermission()
    }
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission.value === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      })
    }
  }

  const scheduleReminder = (todo: Todo) => {
    if (!todo.due_date) return

    const now = new Date()
    const dueDate = new Date(todo.due_date)
    const timeDiff = dueDate.getTime() - now.getTime()

    // 提前 1 小时提醒
    const reminderTime = timeDiff - (60 * 60 * 1000)

    if (reminderTime > 0) {
      setTimeout(() => {
        sendNotification(`任务即将到期`, {
          body: `"${todo.title}" 将在 1 小时后到期`,
          tag: `reminder-${todo.id}`,
          requireInteraction: true
        })
      }, reminderTime)
    }
  }

  return {
    permission: readonly(permission),
    requestPermission,
    sendNotification,
    scheduleReminder
  }
}
```

## 🔧 开发工具扩展

### 9. 国际化支持

**功能描述：**
添加多语言支持，让应用面向全球用户。

**实现步骤：**
```bash
# 安装 i18n 模块
pnpm add @nuxtjs/i18n
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' }
    ],
    defaultLocale: 'zh',
    langDir: 'locales/',
    strategy: 'prefix_except_default'
  }
})
```

### 10. 主题系统扩展

**功能描述：**
支持自定义主题和主题商店。

**实现建议：**
```typescript
// types/theme.ts
export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// composables/useThemeSystem.ts
export function useThemeSystem() {
  const currentTheme = ref<Theme | null>(null)
  const availableThemes = ref<Theme[]>([])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value)
    })
    
    currentTheme.value = theme
    localStorage.setItem('selected-theme', theme.id)
  }

  const loadTheme = async (themeId: string) => {
    const theme = await $fetch(`/api/themes/${themeId}`)
    applyTheme(theme)
  }

  return {
    currentTheme: readonly(currentTheme),
    availableThemes: readonly(availableThemes),
    applyTheme,
    loadTheme
  }
}
```

## 🎯 实施建议

### 优先级排序

1. **高优先级**（立即实施）
   - 高级搜索和过滤
   - 标签系统
   - PWA 支持

2. **中优先级**（短期实施）
   - 子任务功能
   - 时间跟踪
   - 推送通知

3. **低优先级**（长期规划）
   - 协作功能
   - 数据分析
   - 国际化支持

### 实施步骤

1. **需求分析**：确定具体的功能需求和用户场景
2. **技术设计**：设计数据库结构和 API 接口
3. **原型开发**：创建功能原型进行验证
4. **完整实现**：开发完整功能并进行测试
5. **用户反馈**：收集用户反馈并持续改进

这些扩展功能将大大增强 TodoList 应用的实用性和用户体验，使其从简单的任务管理工具发展为功能完整的生产力平台。
