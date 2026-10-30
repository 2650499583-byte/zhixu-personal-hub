export const TYPE_META = {
  idea: { label: '想法', color: '#8a63d2', bg: '#f0eafb' },
  note: { label: '资料', color: '#327aa5', bg: '#e8f3f9' },
  link: { label: '链接', color: '#b87333', bg: '#fbf0e4' },
  task: { label: '待办', color: '#29816f', bg: '#e5f4ef' },
}

export const CATEGORIES = ['工作', '学习', '生活', '灵感', '健康', '财务']

const CATEGORY_WORDS = {
  工作: ['工作', '项目', '产品', '会议', '客户', '团队', '访谈', '复盘', '方案', '设计', '开发', '汇报'],
  学习: ['学习', '阅读', '书籍', '课程', '笔记', '写作', '研究', '论文', '英语', '练习'],
  生活: ['生活', '家人', '朋友', '餐厅', '旅行', '周末', '电影', '生日', '城市', '家务'],
  灵感: ['灵感', '想法', '创意', '或许', '能不能', '可以试试', '想象'],
  健康: ['健康', '运动', '跑步', '睡眠', '饮食', '医生', '健身', '拉伸', '快走'],
  财务: ['财务', '预算', '支出', '账单', '订阅', '投资', '理财', '报销', '费用'],
}

const TAG_WORDS = ['产品', '复盘', '用户研究', '阅读', '写作', '笔记方法', '运动', '旅行', '家人', '会议', '设计', '项目', '订阅', '预算', '灵感', '周末', '健康', '学习']
const STOP_WORDS = new Set(['一个', '我们', '可以', '需要', '已经', '进行', '这个', '什么', '如何', '哪些', '一下', '内容', '相关', '我的', '记录', '以及', '然后', '就是', '因为', '所以', '如果'])

export const uid = () => globalThis.crypto?.randomUUID?.() || `record-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function tokenize(text = '') {
  const normalized = text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[#，。！？、；：,.!?;:'"“”‘’()（）\[\]【】\n\r]/g, ' ')
  const words = normalized.match(/[a-z0-9_-]{2,}|[\u4e00-\u9fa5]{2,}/g) || []
  const tokens = new Set()
  words.forEach((word) => {
    if (/^[a-z0-9_-]+$/.test(word)) {
      tokens.add(word)
      return
    }
    if (word.length <= 3 && !STOP_WORDS.has(word)) tokens.add(word)
    for (let index = 0; index < word.length - 1; index += 1) {
      const gram = word.slice(index, index + 2)
      if (!STOP_WORDS.has(gram)) tokens.add(gram)
    }
  })
  return [...tokens]
}

export function inferType(text) {
  if (/https?:\/\/\S+/i.test(text)) return 'link'
  if (/^\s*([!！]|待办|todo)/i.test(text) || /(记得|尽快|截止|预约|购买|提交|完成|确认|安排|准备|发出|取消)/.test(text)) return 'task'
  if (/(灵感|想法|创意|或许|能不能|可以试试|一个点子)/.test(text)) return 'idea'
  return 'note'
}

export function inferCategory(text, type) {
  let winner = type === 'idea' ? '灵感' : '生活'
  let max = 0
  Object.entries(CATEGORY_WORDS).forEach(([category, words]) => {
    const score = words.reduce((sum, word) => sum + (text.includes(word) ? word.length : 0), 0)
    if (score > max) {
      max = score
      winner = category
    }
  })
  return winner
}

function makeTitle(text, type) {
  const cleaned = text
    .replace(/^\s*([!！]|待办[:：]?|todo[:：]?)/i, '')
    .replace(/#[\w\u4e00-\u9fa5-]+/g, '')
    .trim()
  const first = cleaned.split(/[\n。！？!?]/).find(Boolean) || '未命名记录'
  if (type === 'link') {
    const url = cleaned.match(/https?:\/\/\S+/)?.[0]
    const withoutUrl = first.replace(/https?:\/\/\S+/, '').trim()
    if (!withoutUrl && url) {
      try { return new URL(url).hostname.replace('www.', '') } catch { return '收藏的链接' }
    }
  }
  return first.length > 30 ? `${first.slice(0, 30)}…` : first
}

function makeSummary(text) {
  const clean = text.replace(/https?:\/\/\S+/g, '[链接]').replace(/#[\w\u4e00-\u9fa5-]+/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= 92) return clean
  const sentences = clean.split(/(?<=[。！？!?])/)
  let result = ''
  for (const sentence of sentences) {
    if ((result + sentence).length > 92) break
    result += sentence
  }
  return result ? `${result.replace(/[。！？!?]$/, '')}。` : `${clean.slice(0, 90)}…`
}

function extractPoints(text) {
  return text
    .split(/[\n。！？!?]+/)
    .map((line) => line.replace(/^\s*(?:\d+[.、]|[-•*]|[!！]|待办[:：]?)\s*/, '').replace(/#[\w\u4e00-\u9fa5-]+/g, '').trim())
    .filter((line) => line.length >= 5)
    .slice(0, 3)
    .map((line) => line.length > 48 ? `${line.slice(0, 48)}…` : line)
}

function extractDueDate(text) {
  const now = new Date()
  const explicit = text.match(/(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})日?/)
  if (explicit) return `${explicit[1]}-${String(explicit[2]).padStart(2, '0')}-${String(explicit[3]).padStart(2, '0')}`
  let offset = null
  if (text.includes('今天') || text.includes('今晚')) offset = 0
  if (text.includes('明天') || text.includes('明晚')) offset = 1
  if (text.includes('后天')) offset = 2
  const weekday = text.match(/周([一二三四五六日天])/)
  if (weekday && offset === null) {
    const map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0 }
    const target = map[weekday[1]]
    offset = (target - now.getDay() + 7) % 7
    if (offset === 0) offset = 7
  }
  if (offset === null) return ''
  now.setDate(now.getDate() + offset)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildRecord(input) {
  const content = input.content.trim()
  const type = input.type && input.type !== 'auto' ? input.type : inferType(content)
  const category = input.category && input.category !== 'auto' ? input.category : inferCategory(content, type)
  const inlineTags = [...content.matchAll(/#([\w\u4e00-\u9fa5-]+)/g)].map((match) => match[1])
  const detectedTags = TAG_WORDS.filter((word) => content.includes(word))
  const now = new Date().toISOString()
  return {
    id: uid(),
    title: input.title?.trim() || makeTitle(content, type),
    content,
    type,
    category,
    summary: makeSummary(content),
    keyPoints: extractPoints(content),
    tags: [...new Set([...inlineTags, ...detectedTags, category])].slice(0, 5),
    dueDate: input.dueDate || (type === 'task' ? extractDueDate(content) : ''),
    priority: /(紧急|优先|重要|截止|必须|尽快)/.test(content) ? 'high' : 'medium',
    completed: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    relatedIds: [],
  }
}

function relatedScore(a, b) {
  const aTokens = new Set(tokenize(`${a.title} ${a.tags.join(' ')} ${a.content}`))
  const bTokens = new Set(tokenize(`${b.title} ${b.tags.join(' ')} ${b.content}`))
  let overlap = 0
  aTokens.forEach((token) => { if (bTokens.has(token)) overlap += 1 })
  const sharedTags = a.tags.filter((tag) => b.tags.includes(tag)).length
  const sameCategory = a.category === b.category ? 0.5 : 0
  return overlap / Math.max(4, Math.sqrt(aTokens.size * bTokens.size)) + sharedTags * 0.7 + sameCategory
}

export function enrichRelations(records) {
  const relatedMap = new Map()
  records.forEach((record) => {
    relatedMap.set(record.id, records
      .filter((candidate) => candidate.id !== record.id)
      .map((candidate) => ({ id: candidate.id, score: relatedScore(record, candidate) }))
      .filter((item) => item.score >= 1.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.id))
  })
  return records.map((record) => ({ ...record, relatedIds: relatedMap.get(record.id) || [] }))
}

export function searchRecords(records, query) {
  const clean = query.trim().toLowerCase()
  if (!clean) return records
  const queryTokens = tokenize(clean)
  return records.map((record) => {
    const title = record.title.toLowerCase()
    const content = `${record.content} ${record.summary} ${record.category} ${record.tags.join(' ')}`.toLowerCase()
    let score = title.includes(clean) ? 12 : content.includes(clean) ? 6 : 0
    const recordTokens = new Set(tokenize(`${record.title} ${record.tags.join(' ')} ${record.summary}`))
    queryTokens.forEach((token) => { if (recordTokens.has(token)) score += 1 })
    return { record, score }
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).map((item) => item.record)
}

export function answerQuestion(query, records) {
  const isTaskQuery = /(待办|任务|优先|做什么|接下来|安排)/.test(query)
  const isReviewQuery = /(总结|回顾|阶段|这周|本周|最近)/.test(query) && !isTaskQuery
  if (isTaskQuery) {
    const tasks = records.filter((record) => record.type === 'task' && !record.completed)
      .sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    if (!tasks.length) return { text: '目前没有未完成的待办。你可以把下一件想做的事记下来，我会帮你整理日期和优先级。', sources: [] }
    const sources = tasks.slice(0, 4)
    return {
      text: `你现在有 ${tasks.length} 件未完成待办，我建议先处理这几件：\n${sources.map((task, index) => `${index + 1}. ${task.title}${task.dueDate ? `（${task.dueDate.slice(5).replace('-', '月')}日）` : '（待安排时间）'}`).join('\n')}\n\n先完成最紧急的一件，再处理有明确日期的任务，会比同时推进更轻松。`,
      sources,
    }
  }
  if (isReviewQuery) {
    const review = generateReview(records, 'week')
    return {
      text: `${review.narrative}\n\n本周新增 ${review.total} 条内容，完成 ${review.tasksDone} 件待办，最活跃的主题是「${review.topCategory}」。\n\n建议下一步：${review.actions[0] || '挑选一条旧记录，补充新的思考。'}`,
      sources: review.highlights,
    }
  }
  const sources = searchRecords(records, query).slice(0, 4)
  if (!sources.length) {
    return { text: '我暂时没有在你的内容里找到足够相关的信息。可以换一个关键词，或先记录一些资料后再问我。', sources: [] }
  }
  const points = sources.slice(0, 3).map((record) => `• ${record.summary}`).join('\n')
  return {
    text: `我在你的内容中找到了 ${sources.length} 条相关记录，重点如下：\n${points}\n\n这些内容主要涉及「${[...new Set(sources.map((item) => item.category))].join('、')}」。你可以点击下方来源查看原文。`,
    sources,
  }
}

export function generateReview(records, period = 'week') {
  const days = period === 'month' ? 30 : 7
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days + 1)
  const scoped = records.filter((record) => new Date(record.createdAt) >= cutoff)
  const pool = scoped.length ? scoped : records
  const tasksDone = pool.filter((record) => record.type === 'task' && record.completed).length
  const categoryCounts = CATEGORIES.map((category) => ({ category, count: pool.filter((record) => record.category === category).length }))
    .sort((a, b) => b.count - a.count)
  const topCategory = categoryCounts[0]?.count ? categoryCounts[0].category : '生活'
  const highlights = [...pool].sort((a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  const openTasks = records.filter((record) => record.type === 'task' && !record.completed)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const actions = [
    ...openTasks.slice(0, 2).map((task) => `推进「${task.title}」，先明确一个可完成的小步骤。`),
    pool.some((record) => record.type === 'idea') ? '挑选一条仍有感觉的灵感，把它转成一次具体尝试。' : '留下一条新的观察，让下一次回顾有更多线索。',
  ].slice(0, 3)
  const activity = Array.from({ length: period === 'month' ? 4 : 7 }, (_, index) => {
    if (period === 'week') {
      const date = new Date()
      date.setDate(date.getDate() - 6 + index)
      const key = date.toDateString()
      return { label: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()], count: records.filter((record) => new Date(record.createdAt).toDateString() === key).length }
    }
    const end = new Date()
    end.setDate(end.getDate() - (3 - index) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return { label: `第${index + 1}周`, count: records.filter((record) => new Date(record.createdAt) >= start && new Date(record.createdAt) <= end).length }
  })
  const narrative = pool.length
    ? `这段时间你记录了 ${pool.length} 条内容，其中 ${pool.filter((item) => item.type === 'idea').length} 条灵感和 ${pool.filter((item) => item.type === 'task').length} 件待办。你的注意力主要集中在「${topCategory}」，已经有 ${tasksDone} 件事得到完成。`
    : '这个阶段还没有记录。从一个想法或一件小事开始，就能慢慢形成自己的信息脉络。'
  return {
    total: pool.length,
    ideas: pool.filter((item) => item.type === 'idea').length,
    tasksDone,
    topCategory,
    categoryCounts,
    highlights,
    actions,
    activity,
    narrative,
  }
}

export function formatRelative(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round((target - start) / 86400000)
  if (days === 0) return '今天'
  if (days === -1) return '昨天'
  if (days === 1) return '明天'
  if (days < 0 && days > -7) return `${-days} 天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function dueLabel(dateString) {
  if (!dateString) return '待安排'
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const diff = Math.round((new Date(`${dateString}T00:00:00`) - new Date(`${todayKey}T00:00:00`)) / 86400000)
  if (diff < 0) return `已逾期 ${-diff} 天`
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  return dateString.slice(5).replace('-', '月') + '日'
}
