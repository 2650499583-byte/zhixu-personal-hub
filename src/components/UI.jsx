import React, { useEffect, useRef, useState } from 'react'
import {
  X, ArrowUpRight, CalendarDays, Check, ChevronRight, Circle, Clock3,
  FileText, Lightbulb, Link2, ListTodo, Pencil, Plus, Search, Sparkles,
  Star, Tag, Trash2, WandSparkles,
} from 'lucide-react'
import { CATEGORIES, TYPE_META, buildRecord, dueLabel, formatRelative, searchRecords } from '../lib/intelligence'

export function TypeIcon({ type, size = 16 }) {
  const Icon = { idea: Lightbulb, note: FileText, link: Link2, task: ListTodo }[type] || FileText
  return <Icon size={size} />
}

export function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.note
  return <span className="type-badge" style={{ color: meta.color, background: meta.bg }}><TypeIcon type={type} size={13} />{meta.label}</span>
}

export function Modal({ children, onClose, className = '' }) {
  useEffect(() => {
    const handler = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={`modal ${className}`} role="dialog" aria-modal="true">{children}</section>
  </div>
}

export function EmptyState({ icon: Icon = Search, title, text, action }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={25} /></div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function RecordCard({ record, onClick, onToggle, onFavorite, compact = false }) {
  return <article className={`record-card ${compact ? 'compact' : ''}`} onClick={onClick} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') onClick() }}>
    <div className="record-card-top"><TypeBadge type={record.type} /><button className={`icon-button favorite ${record.favorite ? 'active' : ''}`} aria-label="收藏" onClick={(event) => { event.stopPropagation(); onFavorite?.(record) }}><Star size={16} fill={record.favorite ? 'currentColor' : 'none'} /></button></div>
    <h3>{record.title}</h3>
    <p className="record-summary">{record.summary}</p>
    <div className="tag-row">{record.tags.slice(0, compact ? 2 : 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <div className="record-card-footer">
      <span>{record.type === 'task' ? <><CalendarDays size={13} />{dueLabel(record.dueDate)}</> : formatRelative(record.createdAt)}</span>
      <span className="related-count">{record.relatedIds?.length ? <><Link2 size={13} />{record.relatedIds.length} 条关联</> : record.category}</span>
    </div>
    {record.type === 'task' && <button className={`card-check ${record.completed ? 'done' : ''}`} aria-label={record.completed ? '标记未完成' : '标记完成'} onClick={(event) => { event.stopPropagation(); onToggle?.(record) }}>{record.completed && <Check size={13} />}</button>}
  </article>
}

export function ComposerModal({ onClose, onSave, initial }) {
  const [content, setContent] = useState(initial?.content || '')
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState(initial?.type || 'auto')
  const [category, setCategory] = useState(initial?.category || 'auto')
  const [dueDate, setDueDate] = useState(initial?.dueDate || '')
  const [showOptions, setShowOptions] = useState(Boolean(initial))
  const textarea = useRef(null)
  useEffect(() => { textarea.current?.focus() }, [])
  const submit = () => {
    if (!content.trim()) return
    if (initial) {
      onSave({ ...initial, title: title.trim() || initial.title, content: content.trim(), type, category, dueDate, updatedAt: new Date().toISOString() })
    } else {
      onSave(buildRecord({ content, title, type, category, dueDate }))
    }
  }
  return <Modal onClose={onClose} className="composer-modal">
    <div className="modal-header"><div><span className="eyebrow"><Sparkles size={14} />{initial ? '完善这条记录' : '交给知序整理'}</span><h2>{initial ? '编辑记录' : '此刻，想记下什么？'}</h2></div><button className="icon-button" onClick={onClose}><X size={20} /></button></div>
    <div className="composer-body">
      <textarea ref={textarea} value={content} onChange={(event) => setContent(event.target.value)} placeholder="输入一个想法、一段资料或一件待办…&#10;&#10;小技巧：使用 #标签 快速标记，写下“明天”“周五”等时间会自动识别。" />
      <div className="composer-meta-hint"><WandSparkles size={14} /><span>保存时自动分类、提取摘要并关联已有内容</span></div>
      <button className="text-button options-toggle" onClick={() => setShowOptions(!showOptions)}>{showOptions ? '收起详细选项' : '添加标题、类型或日期'}<ChevronRight size={14} className={showOptions ? 'rotate-90' : ''} /></button>
      {showOptions && <div className="composer-options">
        <label className="full">标题（留空则自动生成）<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这条记录一个标题" /></label>
        <label>内容类型<select value={type} onChange={(event) => setType(event.target.value)}>{!initial && <option value="auto">自动识别</option>}{Object.entries(TYPE_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select></label>
        <label>所属分类<select value={category} onChange={(event) => setCategory(event.target.value)}>{!initial && <option value="auto">自动分类</option>}{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        {(type === 'task' || dueDate) && <label className="full">截止日期<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>}
      </div>}
    </div>
    <div className="modal-footer"><span className="keyboard-hint">内容仅保存在当前浏览器</span><div><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" disabled={!content.trim()} onClick={submit}>{initial ? '保存修改' : '记录并整理'}<ArrowUpRight size={16} /></button></div></div>
  </Modal>
}

export function RecordDetail({ record, records, onClose, onUpdate, onDelete, onEdit, onSelect, onExtractTask }) {
  if (!record) return null
  const related = (record.relatedIds || []).map((id) => records.find((item) => item.id === id)).filter(Boolean)
  return <Modal onClose={onClose} className="detail-modal">
    <div className="detail-topbar"><div className="record-card-top"><TypeBadge type={record.type} /><span className="category-dot">{record.category}</span></div><div className="detail-actions"><button className={`icon-button ${record.favorite ? 'active-favorite' : ''}`} title="收藏" onClick={() => onUpdate({ ...record, favorite: !record.favorite })}><Star size={18} fill={record.favorite ? 'currentColor' : 'none'} /></button><button className="icon-button" title="编辑" onClick={() => onEdit(record)}><Pencil size={17} /></button><button className="icon-button danger" title="删除" onClick={() => onDelete(record)}><Trash2 size={17} /></button><span className="divider-vertical" /><button className="icon-button" onClick={onClose}><X size={20} /></button></div></div>
    <div className="detail-scroll">
      <div className="detail-title"><h2>{record.title}</h2><p>{formatRelative(record.createdAt)}创建 · {formatRelative(record.updatedAt)}更新</p></div>
      {record.type === 'task' && <button className={`task-status-banner ${record.completed ? 'completed' : ''}`} onClick={() => onUpdate({ ...record, completed: !record.completed, updatedAt: new Date().toISOString() })}><span className="check-circle">{record.completed && <Check size={15} />}</span><span>{record.completed ? '已完成，点击可重新打开' : '标记这件待办为已完成'}</span><span className="task-date"><CalendarDays size={14} />{dueLabel(record.dueDate)}</span></button>}
      <section className="detail-section"><h3><FileText size={16} />原文</h3><p className="original-content">{record.content}</p></section>
      <section className="ai-summary-box"><div className="ai-summary-title"><Sparkles size={16} /><h3>内容提要</h3><span>自动提取</span></div><p>{record.summary}</p></section>
      {record.keyPoints?.length > 0 && <section className="detail-section"><h3><ListTodo size={16} />重点信息</h3><div className="key-point-list">{record.keyPoints.map((point, index) => <div key={`${point}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{point}</p>{record.type !== 'task' && <button className="icon-button" title="转为待办" onClick={() => onExtractTask(point, record)}><Plus size={16} /></button>}</div>)}</div></section>}
      <section className="detail-section"><h3><Tag size={16} />标签</h3><div className="detail-tags">{record.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></section>
      <section className="detail-section related-section"><h3><Link2 size={16} />相关内容 <span>{related.length}</span></h3>{related.length ? <div className="related-list">{related.map((item) => <button key={item.id} onClick={() => onSelect(item)}><span className="related-icon" style={{ color: TYPE_META[item.type].color, background: TYPE_META[item.type].bg }}><TypeIcon type={item.type} /></span><span><strong>{item.title}</strong><small>{item.category} · {formatRelative(item.createdAt)}</small></span><ArrowUpRight size={16} /></button>)}</div> : <p className="muted-text">继续记录后，这里会出现与当前内容有关的线索。</p>}</section>
    </div>
  </Modal>
}

export function SearchModal({ records, onClose, onSelect, onViewAll }) {
  const [query, setQuery] = useState('')
  const input = useRef(null)
  useEffect(() => { input.current?.focus() }, [])
  const results = query.trim() ? searchRecords(records, query).slice(0, 6) : [...records].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  return <Modal onClose={onClose} className="search-modal">
    <div className="global-search-input"><Search size={20} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、内容、标签…" onKeyDown={(event) => { if (event.key === 'Enter' && query.trim()) onViewAll(query) }} /><kbd>ESC</kbd></div>
    <div className="search-results"><div className="search-result-label">{query ? `找到 ${results.length} 条最相关内容` : '最近更新'}</div>{results.map((record) => <button className="search-result" key={record.id} onClick={() => onSelect(record)}><span className="related-icon" style={{ color: TYPE_META[record.type].color, background: TYPE_META[record.type].bg }}><TypeIcon type={record.type} /></span><span><strong>{record.title}</strong><small>{record.summary}</small></span><ArrowUpRight size={16} /></button>)}{!results.length && <EmptyState title="没有找到相关内容" text="换个关键词试试，或将它记录为一条新内容。" />}</div>
    {query.trim() && <button className="search-view-all" onClick={() => onViewAll(query)}>在全部内容中查看搜索结果<ChevronRight size={15} /></button>}
  </Modal>
}

export function Toast({ message, onClose }) {
  useEffect(() => { const timer = setTimeout(onClose, 2800); return () => clearTimeout(timer) }, [message, onClose])
  return <div className="toast"><span><Check size={14} /></span>{message}<button onClick={onClose}><X size={14} /></button></div>
}
