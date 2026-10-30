import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  BarChart3, BookOpen, BrainCircuit, Check, ChevronRight, CloudOff, Command,
  Database, Download, HardDrive, LayoutDashboard, LibraryBig, ListTodo, Menu,
  MessageCircleMore, Plus, Search, Settings2, ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Tasks from './pages/Tasks'
import Assistant from './pages/Assistant'
import Review from './pages/Review'
import { ComposerModal, Modal, RecordDetail, SearchModal, Toast } from './components/UI'
import { buildRecord, enrichRelations, uid } from './lib/intelligence'
import { createSeedRecords, isDemoRecord } from './lib/seed'
import { downloadBackup, loadChat, loadRecords, readBackup, saveChat, saveRecords } from './lib/storage'

const NAV_ITEMS = [
  { id: 'dashboard', label: '今日概览', icon: LayoutDashboard },
  { id: 'library', label: '全部内容', icon: LibraryBig },
  { id: 'tasks', label: '待办事项', icon: ListTodo },
  { id: 'assistant', label: '智能助手', icon: MessageCircleMore, accent: true },
  { id: 'review', label: '阶段回顾', icon: BarChart3 },
]

export default function App() {
  const [records, setRecords] = useState(() => enrichRelations(loadRecords(createSeedRecords())))
  const [activePage, setActivePage] = useState('dashboard')
  const [composer, setComposer] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [dataOpen, setDataOpen] = useState(false)
  const [messages, setMessages] = useState(loadChat)
  const [prompt, setPrompt] = useState(null)
  const importRef = useRef(null)
  const closeToast = useCallback(() => setToast(''), [])
  const selected = records.find((record) => record.id === selectedId)

  useEffect(() => { saveRecords(records) }, [records])
  useEffect(() => { saveChat(messages) }, [messages])
  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setComposer({})
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navigate = (page) => {
    setActivePage(page)
    setMobileNav(false)
    if (page === 'library') setLibraryQuery('')
  }

  const addCapture = (text, autoOrganize = true) => {
    let record = buildRecord({ content: text })
    if (!autoOrganize) record = { ...record, summary: text.trim(), keyPoints: [], tags: [], relatedIds: [] }
    setRecords((current) => {
      const next = enrichRelations([record, ...current])
      record = next.find((item) => item.id === record.id)
      return next
    })
    setToast(`已整理为「${record.category} · ${{ idea: '想法', note: '资料', link: '链接', task: '待办' }[record.type]}」`)
    return record
  }

  const saveComposer = (record) => {
    const exists = records.some((item) => item.id === record.id)
    if (exists) {
      const old = records.find((item) => item.id === record.id)
      if (old.content !== record.content) {
        const rebuilt = buildRecord(record)
        record = { ...record, summary: rebuilt.summary, keyPoints: rebuilt.keyPoints, tags: rebuilt.tags }
      }
      updateRecord(record)
      setSelectedId(record.id)
      setToast('修改已保存')
    } else {
      setRecords((current) => enrichRelations([record, ...current]))
      setToast('记录已保存并完成整理')
    }
    setComposer(null)
  }

  const updateRecord = (updated) => {
    setRecords((current) => enrichRelations(current.map((record) => record.id === updated.id ? { ...updated, updatedAt: updated.updatedAt || new Date().toISOString() } : record)))
  }

  const deleteRecord = (record) => {
    if (!window.confirm(`确定删除「${record.title}」吗？此操作无法撤销。`)) return
    setRecords((current) => enrichRelations(current.filter((item) => item.id !== record.id)))
    setSelectedId(null)
    setToast('记录已删除')
  }

  const toggleTask = (task) => {
    updateRecord({ ...task, completed: !task.completed })
    setToast(task.completed ? '已重新打开待办' : '完成一件，稳稳推进')
  }

  const extractTask = (point, source) => {
    const task = buildRecord({ content: `！${point}`, title: point, type: 'task', category: source.category })
    setRecords((current) => enrichRelations([task, ...current]))
    setToast('已将重点转为待办')
  }

  const ask = (text) => {
    setPrompt({ text, id: uid() })
    navigate('assistant')
  }

  const viewSearchResults = (query) => {
    setLibraryQuery(query)
    setActivePage('library')
    setSearchOpen(false)
  }

  const importData = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = await readBackup(file)
      setRecords((current) => {
        const existing = new Set(current.map((item) => item.id))
        return enrichRelations([...imported.filter((item) => !existing.has(item.id)), ...current])
      })
      setDataOpen(false)
      setToast(`已导入 ${imported.length} 条记录`)
    } catch (error) {
      setToast(error.message || '导入失败，请检查备份文件')
    }
  }

  const weekCount = records.filter((record) => Date.now() - new Date(record.createdAt).getTime() < 7 * 86400000).length
  const demoCount = records.filter(isDemoRecord).length
  const clearDemo = () => {
    if (!window.confirm(`将清除 ${demoCount} 条内置示例内容，你自己的记录不受影响。确定继续吗？`)) return
    setRecords((current) => enrichRelations(current.filter((record) => !isDemoRecord(record))))
    setSelectedId(null)
    setToast('示例内容已清除，现在从空白开始')
  }

  return <div className="app-shell">
    {mobileNav && <div className="mobile-nav-backdrop" onClick={() => setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><i /><i /><i /></span><div><strong>知序</strong><small>个人信息管家</small></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={19} /></button></div>
      <button className="sidebar-create" onClick={() => { setComposer({}); setMobileNav(false) }}><Plus size={17} />记录新内容<span>⌘ N</span></button>
      <nav className="main-nav"><span className="nav-section-label">我的空间</span>{NAV_ITEMS.map(({ id, label, icon: Icon, accent }) => <button key={id} className={`${activePage === id ? 'active' : ''} ${accent ? 'accent' : ''}`} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{id === 'tasks' && records.filter((item) => item.type === 'task' && !item.completed).length > 0 && <i className="nav-count">{records.filter((item) => item.type === 'task' && !item.completed).length}</i>}{id === 'assistant' && <Sparkles size={12} className="nav-spark" />}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="weekly-goal"><div><span>本周记录</span><strong>{weekCount}<small> / 20</small></strong></div><div className="goal-track"><i style={{ width: `${Math.min(100, weekCount / 20 * 100)}%` }} /></div><p>{weekCount >= 20 ? '目标达成，保持你的节奏。' : `再记录 ${20 - weekCount} 条，达成本周小目标`}</p></div>
      <button className="local-mode-card" onClick={() => setDataOpen(true)}><span><HardDrive size={17} /></span><div><strong>本地存储模式</strong><small><i />所有更改已保存</small></div><ChevronRight size={15} /></button>
      <div className="sidebar-footer"><span>ZHIXU PERSONAL SPACE</span><small>让信息有序，让行动发生</small></div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button><button className="top-search" onClick={() => setSearchOpen(true)}><Search size={17} /><span>搜索你的想法、资料和待办…</span><kbd><Command size={11} /> K</kbd></button><div className="topbar-right"><span className="save-status"><span><Check size={11} /></span>已自动保存</span><span className="topbar-divider" /><button className="data-button" onClick={() => setDataOpen(true)} title="数据管理"><Settings2 size={18} /></button><button className="profile-button" onClick={() => setDataOpen(true)}>序</button></div></header>
      <main className={activePage === 'assistant' ? 'assistant-main-wrapper' : ''}>
        {activePage === 'dashboard' && <Dashboard records={records} onClearDemo={clearDemo} onCapture={addCapture} onOpenComposer={() => setComposer({})} onSelect={(record) => setSelectedId(record.id)} onToggleTask={toggleTask} onFavorite={(record) => updateRecord({ ...record, favorite: !record.favorite })} onNavigate={navigate} onAsk={ask} />}
        {activePage === 'library' && <Library key={libraryQuery} records={records} initialQuery={libraryQuery} onSelect={(record) => setSelectedId(record.id)} onToggleTask={toggleTask} onFavorite={(record) => updateRecord({ ...record, favorite: !record.favorite })} onOpenComposer={() => setComposer({})} />}
        {activePage === 'tasks' && <Tasks records={records} onCapture={addCapture} onSelect={(record) => setSelectedId(record.id)} onToggleTask={toggleTask} />}
        {activePage === 'assistant' && <Assistant records={records} messages={messages} setMessages={setMessages} initialPrompt={prompt} onSelect={(record) => setSelectedId(record.id)} />}
        {activePage === 'review' && <Review records={records} onSelect={(record) => setSelectedId(record.id)} onNavigate={navigate} onToast={setToast} />}
      </main>
    </div>

    {composer && <ComposerModal initial={composer.id ? composer : null} onClose={() => setComposer(null)} onSave={saveComposer} />}
    {selected && <RecordDetail record={selected} records={records} onClose={() => setSelectedId(null)} onUpdate={updateRecord} onDelete={deleteRecord} onEdit={(record) => { setSelectedId(null); setComposer(record) }} onSelect={(record) => setSelectedId(record.id)} onExtractTask={extractTask} />}
    {searchOpen && <SearchModal records={records} onClose={() => setSearchOpen(false)} onSelect={(record) => { setSearchOpen(false); setSelectedId(record.id) }} onViewAll={viewSearchResults} />}
    {dataOpen && <Modal onClose={() => setDataOpen(false)} className="data-modal"><div className="modal-header"><div><span className="eyebrow"><Database size={14} />数据与存储</span><h2>你的内容，由你掌握</h2></div><button className="icon-button" onClick={() => setDataOpen(false)}><X size={20} /></button></div><div className="data-modal-body"><div className="storage-status"><span><HardDrive size={22} /></span><div><strong>浏览器本地存储</strong><p>{records.length} 条记录 · 所有更改会自动保存在当前设备与浏览器中</p></div><i>运行中</i></div><div className="local-notice"><CloudOff size={18} /><p><strong>当前未连接云服务</strong>此版本不会上传数据。清除浏览器数据前，请先导出备份；跨设备同步与云端大模型需在授权云服务后接入。</p></div><div className="data-actions-grid"><button onClick={() => downloadBackup(records)}><span><Download size={20} /></span><strong>导出完整备份</strong><small>下载 JSON 格式，随时可恢复</small><ChevronRight size={16} /></button><button onClick={() => importRef.current?.click()}><span><Upload size={20} /></span><strong>导入历史备份</strong><small>合并不重复的记录，不覆盖现有内容</small><ChevronRight size={16} /></button></div><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importData} />{demoCount > 0 && <div className="demo-strip"><span><Sparkles size={14} />当前有 {demoCount} 条内置示例内容，不是你的真实记录</span><button onClick={clearDemo}>清除示例，从空白开始</button></div>}<div className="data-privacy"><ShieldCheck size={16} /><span>无需账号，不采集个人信息。建议定期导出备份。</span></div></div></Modal>}
    {toast && <Toast message={toast} onClose={closeToast} />}
  </div>
}
