import React, { useMemo, useState } from 'react'
import { Grid2X2, List, Plus, Search, SlidersHorizontal, Star, X } from 'lucide-react'
import { EmptyState, RecordCard } from '../components/UI'
import { CATEGORIES, TYPE_META, searchRecords } from '../lib/intelligence'

export default function Library({ records, initialQuery, onSelect, onToggleTask, onFavorite, onOpenComposer }) {
  const [query, setQuery] = useState(initialQuery || '')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [sort, setSort] = useState('updated')
  const [view, setView] = useState('grid')
  const filtered = useMemo(() => {
    const result = searchRecords(records, query).filter((record) => (type === 'all' || record.type === type) && (category === 'all' || record.category === category) && (!favoriteOnly || record.favorite))
    return [...result].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'zh-CN') : sort === 'created' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [records, query, type, category, favoriteOnly, sort])
  const reset = () => { setQuery(''); setType('all'); setCategory('all'); setFavoriteOnly(false) }
  return <div className="page library-page">
    <div className="page-title-row"><div><span className="eyebrow">你的信息资产</span><h1>全部内容</h1><p>每一条记录都在这里，也都能被重新找到。</p></div><button className="button primary" onClick={onOpenComposer}><Plus size={17} />新建记录</button></div>
    <div className="library-toolbar card"><div className="library-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、正文、摘要或 #标签" />{query && <button onClick={() => setQuery('')}><X size={15} /></button>}</div><div className="toolbar-actions"><button className={`filter-button ${favoriteOnly ? 'active' : ''}`} onClick={() => setFavoriteOnly(!favoriteOnly)}><Star size={16} fill={favoriteOnly ? 'currentColor' : 'none'} />收藏</button><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">全部分类</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">最近更新</option><option value="created">最近创建</option><option value="title">按标题</option></select><span className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} title="卡片视图"><Grid2X2 size={16} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} title="列表视图"><List size={17} /></button></span></div></div>
    <div className="filter-tabs">{['all', ...Object.keys(TYPE_META)].map((key) => <button key={key} className={type === key ? 'active' : ''} onClick={() => setType(key)}>{key === 'all' ? '全部' : TYPE_META[key].label}<span>{key === 'all' ? records.length : records.filter((record) => record.type === key).length}</span></button>)}</div>
    <div className="results-meta"><span>共 <strong>{filtered.length}</strong> 条内容{(query || type !== 'all' || category !== 'all' || favoriteOnly) && <button onClick={reset}>清除筛选</button>}</span><span>按内容与标签智能匹配</span></div>
    {filtered.length ? <div className={`records-grid ${view === 'list' ? 'list-view' : ''}`}>{filtered.map((record) => <RecordCard key={record.id} record={record} onClick={() => onSelect(record)} onToggle={onToggleTask} onFavorite={onFavorite} compact={view === 'list'} />)}</div> : <EmptyState title="这里还没有匹配的内容" text="换个筛选条件，或者记录一条新的想法。" action={<button className="button primary" onClick={onOpenComposer}><Plus size={16} />记一笔</button>} />}
  </div>
}
