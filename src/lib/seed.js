const day = (offset = 0, hour = 9) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  date.setHours(hour, 20, 0, 0)
  return date.toISOString()
}

const dateOnly = (offset = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

// 内置示例内容：新数据带 demo 标记，旧版本保存过的示例按 seed- 前缀识别。
export const isDemoRecord = (record) => Boolean(record?.demo) || String(record?.id || '').startsWith('seed-')

// 首次打开时用于演示功能的示例内容，全部带 demo 标记，可一键清除。
export function createSeedRecords() {
  const seeds = [
    {
      id: 'seed-product-review', type: 'note', category: '工作',
      title: '产品复盘会：三个值得保留的判断',
      content: '这次产品复盘有三个关键结论：\n1. 新手引导不应一次展示所有功能，先帮助用户完成第一个任务。\n2. 用户更在意整理后的结果，而不是记录过程本身。\n3. 下周需要邀请 5 位新用户参与可用性访谈，重点观察首次记录是否顺畅。',
      summary: '复盘确认：新手引导应聚焦首个任务，用整理结果体现价值，并通过访谈继续验证。',
      keyPoints: ['新手引导先帮助用户完成第一个任务', '优先呈现整理后的价值', '邀请 5 位新用户参与可用性访谈'],
      tags: ['产品', '复盘', '用户研究'], dueDate: '', priority: 'medium', completed: false,
      favorite: true, createdAt: day(-1, 16), updatedAt: day(-1, 16), relatedIds: ['seed-user-interview', 'seed-onboarding-idea'],
    },
    {
      id: 'seed-user-interview', type: 'task', category: '工作',
      title: '确认下周用户访谈名单与时间',
      content: '需要确认下周用户访谈名单与时间，优先邀请最近两周首次使用的新用户，共 5 人。周四前发出邀请。',
      summary: '周四前确认 5 位新用户并发出访谈邀请。',
      keyPoints: ['筛选最近两周首次使用的新用户', '确认 5 位访谈对象', '周四前发出邀请'],
      tags: ['用户研究', '访谈', '优先'], dueDate: dateOnly(1), priority: 'high', completed: false,
      favorite: false, createdAt: day(0, 8), updatedAt: day(0, 8), relatedIds: ['seed-product-review'],
    },
    {
      id: 'seed-onboarding-idea', type: 'idea', category: '灵感',
      title: '把首次记录变成一次小小的成就感',
      content: '一个想法：用户完成第一条记录后，不只提示“保存成功”，而是立即展示自动提取的重点和关联内容，让价值在 10 秒内被看见。',
      summary: '首次保存后立即展示重点与关联，让用户快速感受到整理价值。',
      keyPoints: ['首次记录后即时反馈', '展示自动提取的重点', '推荐一条有关联的旧内容'],
      tags: ['产品', '新手引导', '灵感'], dueDate: '', priority: 'medium', completed: false,
      favorite: true, createdAt: day(-2, 11), updatedAt: day(-2, 11), relatedIds: ['seed-product-review'],
    },
    {
      id: 'seed-reading', type: 'note', category: '学习',
      title: '《卡片笔记写作法》阅读摘记',
      content: '真正重要的不是收藏，而是用自己的话重新表达。闪念笔记需要在一两天内转成永久笔记，并主动建立与已有笔记的连接。写作不是从零开始，而是从一组已经思考过的卡片开始。',
      summary: '用自己的话重写笔记，及时转化闪念，并通过连接已有笔记积累可复用的思考。',
      keyPoints: ['收藏不等于理解', '闪念笔记要及时转化', '主动建立笔记之间的连接'],
      tags: ['阅读', '笔记方法', '写作'], dueDate: '', priority: 'low', completed: false,
      favorite: true, createdAt: day(-4, 21), updatedAt: day(-4, 21), relatedIds: ['seed-writing-task'],
    },
    {
      id: 'seed-writing-task', type: 'task', category: '学习',
      title: '整理阅读卡片并写成一篇短文',
      content: '周末整理最近的阅读卡片，选一个有真实感受的主题，写一篇 800 字短文，不追求完整，先形成自己的观点。',
      summary: '周末从阅读卡片中选题，完成一篇 800 字短文。',
      keyPoints: ['整理近期阅读卡片', '选择一个有真实感受的主题', '完成 800 字短文初稿'],
      tags: ['阅读', '写作'], dueDate: dateOnly(3), priority: 'medium', completed: false,
      favorite: false, createdAt: day(-1, 20), updatedAt: day(-1, 20), relatedIds: ['seed-reading'],
    },
    {
      id: 'seed-walk', type: 'idea', category: '生活',
      title: '周末城市漫步路线',
      content: '周末如果天气好，想去老城区走一条不赶时间的路线：先到独立书店，再沿河边走到旧邮局，最后找一家小店吃晚饭。带上相机，不安排太满。',
      summary: '周末沿书店、河边和旧邮局安排轻松的城市漫步，留足自由时间。',
      keyPoints: ['独立书店作为起点', '沿河边步行至旧邮局', '保留不赶时间的空白'],
      tags: ['周末', '城市漫步', '摄影'], dueDate: '', priority: 'low', completed: false,
      favorite: false, createdAt: day(-3, 13), updatedAt: day(-3, 13), relatedIds: [],
    },
    {
      id: 'seed-health', type: 'task', category: '健康',
      title: '完成本周三次轻运动',
      content: '本周安排三次 30 分钟轻运动，以快走和拉伸为主。已经完成两次，周五晚上完成最后一次，不追求强度。',
      summary: '本周三次轻运动已完成两次，周五完成最后一次。',
      keyPoints: ['每次 30 分钟', '以快走和拉伸为主', '本周已完成两次'],
      tags: ['运动', '习惯'], dueDate: dateOnly(0), priority: 'medium', completed: false,
      favorite: false, createdAt: day(-5, 8), updatedAt: day(-1, 19), relatedIds: [],
    },
    {
      id: 'seed-expense', type: 'note', category: '财务',
      title: '十月订阅服务检查',
      content: '十月订阅支出比预期高。视频会员有两个重复，云盘空间利用率不高。下个月取消一个视频会员，云盘改为按年评估，保留真正高频使用的工具。',
      summary: '十月订阅支出偏高，需取消重复视频会员并重新评估低频云盘。',
      keyPoints: ['取消一个重复的视频会员', '评估云盘真实使用频率', '保留高频使用的工具'],
      tags: ['订阅', '月度检查'], dueDate: '', priority: 'medium', completed: false,
      favorite: false, createdAt: day(-6, 18), updatedAt: day(-6, 18), relatedIds: [],
    },
    {
      id: 'seed-finished', type: 'task', category: '生活',
      title: '给家人预订生日餐厅',
      content: '已确认周日晚餐餐厅，并备注靠窗座位和不甜的生日蛋糕。',
      summary: '生日餐厅与座位、蛋糕偏好均已确认。',
      keyPoints: ['餐厅已预订', '备注靠窗座位', '蛋糕选择低糖'],
      tags: ['家人', '生日'], dueDate: dateOnly(-1), priority: 'medium', completed: true,
      favorite: false, createdAt: day(-7, 10), updatedAt: day(-1, 12), relatedIds: [],
    },
  ]
  return seeds.map((record) => ({ ...record, demo: true }))
}
