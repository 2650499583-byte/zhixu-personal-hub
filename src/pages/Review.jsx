import React, { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, BarChart3, CalendarRange, Check, CheckCircle2, ChevronRight, Clipboard, Download, FileText, Lightbulb, ListTodo, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react'
import { generateReview } from '../lib/intelligence'
import { TypeIcon } from '../components/UI'

export default function Review({ records, onSelect, onNavigate, onToast }) {
  const [period, setPeriod] = useState('week')
  const [refreshKey, setRefreshKey] = useState(0)
  const review = useMemo(() => generateReview(records, period), [records, period, refreshKey])
  const maxActivity = Math.max(1, ...review.activity.map((item) => item.count))
  const reportText = `知序 · ${period === 'week' ? '本周' : '本月'}回顾\n\n${review.narrative}\n\n重点内容\n${review.highlights.map((item) => `- ${item.title}：${item.summary}`).join('\n')}\n\n后续行动建议\n${review.actions.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(reportText); onToast('阶段总结已复制') } catch { onToast('复制失败，请使用导出功能') }
  }
  const download = () => {
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `知序-${period === 'week' ? '周' : '月'}度回顾.md`
    link.click()
    URL.revokeObjectURL(url)
    onToast('回顾已导出')
  }
  return <div className="page review-page">
    <div className="page-title-row"><div><span className="eyebrow">看见积累，也看见方向</span><h1>阶段回顾</h1><p>从零散记录中，读懂这一段时间的自己。</p></div><div className="review-actions"><button className="button secondary" onClick={copy}><Clipboard size={15} />复制总结</button><button className="button primary" onClick={() => { setRefreshKey((key) => key + 1); onToast('已根据最新内容重新梳理') }}><RefreshCw size={15} />重新梳理</button></div></div>
    <div className="review-period-bar"><div className="period-tabs"><button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>本周回顾</button><button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>本月回顾</button></div><span><CalendarRange size={15} />{period === 'week' ? '最近 7 天' : '最近 30 天'} · 截至今天</span></div>
    <section className="review-narrative"><div className="narrative-icon"><Sparkles size={24} /></div><div><span>{period === 'week' ? 'WEEKLY REVIEW' : 'MONTHLY REVIEW'}</span><h2>你的信息脉络，正在慢慢清晰。</h2><p>{review.narrative}</p></div><div className="narrative-stamp"><strong>{review.total}</strong><span>条阶段记录</span></div></section>
    <div className="review-stat-grid"><div><span className="stat-icon green"><FileText size={18} /></span><p>新增内容</p><strong>{review.total}<small>条</small></strong><em>持续记录，就是积累</em></div><div><span className="stat-icon purple"><Lightbulb size={18} /></span><p>灵感想法</p><strong>{review.ideas}<small>条</small></strong><em>保留每个可能性</em></div><div><span className="stat-icon blue"><CheckCircle2 size={18} /></span><p>完成待办</p><strong>{review.tasksDone}<small>件</small></strong><em>行动让想法落地</em></div><div><span className="stat-icon orange"><Target size={18} /></span><p>关注主题</p><strong className="text-value">{review.topCategory}</strong><em>本阶段最活跃分类</em></div></div>
    <div className="review-main-grid">
      <section className="activity-card card"><div className="section-heading inline"><div><h2>记录节奏</h2><p>不在于每天很多，而在于持续发生</p></div><BarChart3 size={19} /></div><div className={`activity-chart ${period === 'month' ? 'monthly' : ''}`}>{review.activity.map((item, index) => <div className="activity-column" key={`${item.label}-${index}`}><span className="bar-value">{item.count || ''}</span><div className="bar-track"><i style={{ height: `${Math.max(item.count ? 12 : 3, item.count / maxActivity * 100)}%` }} /></div><span>{item.label}</span></div>)}</div><div className="activity-insight"><TrendingUp size={16} /><span>{review.total > 0 ? `「${review.topCategory}」是你近期最常记录的主题，不妨沿着这条线索继续深入。` : '先记录一条想法，下一次回顾就会有新的发现。'}</span></div></section>
      <section className="action-plan card"><div className="section-heading inline"><div><h2>接下来，可以这样做</h2><p>从已有内容生成的行动建议</p></div><ListTodo size={19} /></div><div className="action-plan-list">{review.actions.map((action, index) => <div key={action}><span>{index + 1}</span><p>{action}</p></div>)}</div><button className="button secondary full-width" onClick={() => onNavigate('tasks')}>查看我的待办<ArrowRight size={15} /></button></section>
    </div>
    <section className="review-highlights"><div className="section-heading inline"><div><h2>值得再看一眼</h2><p>本阶段的重点与收藏</p></div><button className="text-link" onClick={download}><Download size={14} />导出回顾</button></div><div className="highlight-grid">{review.highlights.map((record) => <button key={record.id} onClick={() => onSelect(record)}><div><span className={`recent-type type-${record.type}`}><TypeIcon type={record.type} /></span><small>{record.category} · {record.type === 'task' ? '待办' : '记录'}</small><ArrowUpRight size={16} /></div><h3>{record.title}</h3><p>{record.summary}</p><span className="highlight-link">查看原文<ChevronRight size={14} /></span></button>)}</div></section>
  </div>
}
