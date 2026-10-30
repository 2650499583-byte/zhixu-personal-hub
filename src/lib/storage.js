const STORAGE_KEY = 'zhixu.records.v1'
const CHAT_KEY = 'zhixu.chat.v1'

export function loadRecords(fallback) {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return fallback
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function loadChat() {
  try {
    const value = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
    return Array.isArray(value) ? value.slice(-30) : []
  } catch {
    return []
  }
}

export function saveChat(messages) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30)))
  } catch {
    // Chat persistence is optional; records remain unaffected.
  }
}

export function downloadBackup(records) {
  const payload = {
    app: '知序',
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `知序备份-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBackup(file) {
  if (!file || file.size > 5 * 1024 * 1024) throw new Error('请选择 5MB 以内的知序备份文件')
  const parsed = JSON.parse(await file.text())
  const records = Array.isArray(parsed) ? parsed : parsed.records
  if (!Array.isArray(records)) throw new Error('备份格式不正确，请选择知序导出的 JSON 文件')
  const valid = records.every((item) => item && typeof item.id === 'string' && typeof item.content === 'string')
  if (!valid) throw new Error('备份内容不完整，未导入任何数据')
  return records
}
