import React, { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, CalendarDays, Check, ChevronRight, Circle, Clock3, FileText, Lightbulb, Link2, ListTodo, Plus, Sparkles, Target, WandSparkles } from 'lucide-react'
import { RecordCard, TypeBadge, TypeIcon } from '../components/UI'
import { CATEGORIES, dueLabel, formatRelative } from '../lib/intelligence'
import { isDemoRecord } from '../lib/seed'

export default function Dashboard({ records, onClearDemo, onCapture, onOpenComposer, onSelect, onToggleTask, onFavorite, onNavigate, onAsk }) {
  const [capture, setCapture] = useState('')
  const [autoOrganize, setAutoOrganize] = useState(true)
  const recent = useMemo(() => [...records].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4), [records])
  const tasks = useMemo(() => records.filter((record) => record.type === 'task' && !record.completed).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 4), [records])
  const openTasks = records.filter((record) => record.type === 'task' && !record.completed)
  const completed = records.filter((record) => record.type === 'task' && record.completed).length
  const relations = records.reduce((sum, record) => sum + (record.relatedIds?.length || 0), 0) / 2
  const hour = new Date().getHours()
  const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
  const dateText = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
  const topPriority = openTasks.find((task) => task.priority === 'high') || openTasks[0]
  const submitCapture = () => {
    if (!capture.trim()) return
    onCapture(capture, autoOrganize)
    setCapture('')
  }
  const categoryStats = CATEGORIES.map((category) => ({ category, count: records.filter((record) => record.category === category).length })).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxCategory = Math.max(1, ...categoryStats.map((item) => item.count))
  const demoRecords = records.filter(isDemoRecord)

  return <div className="page dashboard-page">
    {demoRecords.length > 0 && <div className="demo-banner">
      <Sparkles size={15} />
      <span>现在看到的是 <strong>{demoRecords.length} 条内置示例内容</strong>（不是你的真实记录），清除后即可从空白开始。</span>
      <button onClick={onClearDemo}>清除示例内容</button>
    </div>}
    <div className="welcome-row">
      <div><div className="date-label"><span />{dateText}</div><h1>{greeting}，今天也一起理清思路。</h1><p>把零散的信息放进来，把清晰的行动带出去。</p></div>
      <div className="welcome-actions"><button className="button secondary" onClick={() => onAsk('我今天最应该关注什么？')}><Sparkles size={16} />问问助手</button><button className="button primary" onClick={onOpenComposer}><Plus size={17} />记一笔</button></div>
    </div>

    <div className="dashboard-hero-grid">
      <section className="quick-capture card">
        <div className="section-heading"><div><span className="eyebrow"><WandSparkles size={14} />快速记录</span><h2>先记下来，其余的交给知序</h2></div><span className="shortcut-hint">随时捕捉，不错过灵感</span></div>
        <div className="capture-input-wrap"><textarea value={capture} onChange={(event) => setCapture(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submitCapture() }} placeholder="一个想法、一段资料，或一件要做的事…" /><div className="capture-bottom"><div className="capture-tools"><button className={`auto-pill ${autoOrganize ? 'active' : ''}`} onClick={() => setAutoOrganize(!autoOrganize)}><Sparkles size={13} />智能整理<span className="mini-switch"><i /></span></button><span>Ctrl + Enter</span></div><button className="capture-submit" disabled={!capture.trim()} onClick={submitCapture}><ArrowUpRight size={19} /></button></div></div>
        <div className="capture-examples"><span>试试：</span>{['明天下午确认访谈时间', '#灵感 做一个每周回顾', '整理今天的阅读笔记'].map((example) => <button key={example} onClick={() => setCapture(example)}>{example}</button>)}</div>
      </section>

      <section className="daily-brief">
        <div className="brief-decoration"><Sparkles size={90} /></div><div className="brief-top"><span><Sparkles size={15} />今日导读</span><small>自动梳理</small></div>
        <h2>{topPriority ? '从最重要的一件小事开始。' : '留一点空白，听听新的想法。'}</h2>
        <p>{topPriority ? <>「{topPriority.title}」{topPriority.dueDate ? `将在${dueLabel(topPriority.dueDate)}到期` : '还没有安排时间'}，建议优先推进。另有 {Math.max(0, openTasks.length - 1)} 件待办已为你整理好。</> : '现在没有未完成的待办。可以从最近收藏的一条灵感开始，给它一个新的延伸。'}</p>
        <button onClick={() => onNavigate('review')}>看看近期脉络<ArrowRight size={15} /></button>
        <div className="brief-footer"><span className="tiny-avatar"><BrainCircuit size={13} /></span>基于你的 {records.length} 条内容生成</div>
      </section>
    </div>

    <div className="stats-grid">
      <button className="stat-card" onClick={() => onNavigate('library')}><span className="stat-icon green"><FileText size={19} /></span><div><strong>{records.length}</strong><span>全部记录</span></div><small>持续积累中</small><ArrowUpRight size={15} /></button>
      <button className="stat-card" onClick={() => onNavigate('library')}><span className="stat-icon purple"><Lightbulb size={19} /></span><div><strong>{records.filter((record) => record.type === 'idea').length}</strong><span>灵感想法</span></div><small>每个念头都值得</small><ArrowUpRight size={15} /></button>
      <button className="stat-card" onClick={() => onNavigate('tasks')}><span className="stat-icon blue"><ListTodo size={19} /></span><div><strong>{openTasks.length}</strong><span>待办事项</span></div><small>{completed} 件已完成</small><ArrowUpRight size={15} /></button>
      <button className="stat-card" onClick={() => onNavigate('library')}><span className="stat-icon orange"><Link2 size={19} /></span><div><strong>{Math.round(relations)}</strong><span>内容关联</span></div><small>知识正在连接</small><ArrowUpRight size={15} /></button>
    </div>

    <div className="dashboard-content-grid">
      <section className="recent-section card">
        <div className="section-heading inline"><div><h2>最近记录</h2><p>继续刚才的思考</p></div><button className="text-link" onClick={() => onNavigate('library')}>查看全部<ChevronRight size={15} /></button></div>
        <div className="recent-list">{recent.map((record) => <button className="recent-item" key={record.id} onClick={() => onSelect(record)}><span className={`recent-type type-${record.type}`}><TypeIcon type={record.type} size={18} /></span><span className="recent-copy"><strong>{record.title}</strong><small>{record.summary}</small><span className="recent-tags"><i>{record.category}</i>{record.tags.slice(0, 2).map((tag) => <i key={tag}>#{tag}</i>)}</span></span><span className="recent-time">{formatRelative(record.updatedAt)}<ArrowUpRight size={15} /></span></button>)}{!recent.length && <div className="empty-hint"><strong>这里还空着</strong><p>在上方记录第一条想法、资料或待办，知序会自动帮你分类、提取重点并建立关联。</p></div>}</div>
      </section>

      <div className="dashboard-side-stack">
        <section className="upcoming-card card"><div className="section-heading inline"><div><h2>接下来</h2><p>{openTasks.length} 件待办待推进</p></div><button className="text-link" onClick={() => onNavigate('tasks')}>全部<ChevronRight size={15} /></button></div><div className="mini-task-list">{tasks.map((task) => <div className="mini-task" key={task.id}><button className="check-circle" onClick={() => onToggleTask(task)} /><button className="mini-task-copy" onClick={() => onSelect(task)}><strong>{task.title}</strong><small className={dueLabel(task.dueDate).includes('逾期') ? 'overdue' : ''}><Clock3 size={12} />{dueLabel(task.dueDate)}{task.priority === 'high' && <i>优先</i>}</small></button></div>)}{!tasks.length && <p className="muted-text">{records.some((record) => record.type === 'task') ? '所有待办都已完成，做得不错。' : '还没有待办，先记录一件要做的事。'}</p>}</div></section>
        <section className="category-card card"><div className="section-heading inline"><div><h2>内容分布</h2><p>你的注意力地图</p></div><Target size={18} /></div><div className="category-bars">{categoryStats.map((item, index) => <div key={item.category}><span>{item.category}</span><div><i className={`bar-color-${index}`} style={{ width: `${Math.max(8, item.count / maxCategory * 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div></section>
      </div>
    </div>
  </div>
}
