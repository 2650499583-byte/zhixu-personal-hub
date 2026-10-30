import React, { useMemo, useState } from 'react'
import { ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronRight, Circle, Clock3, Flag, ListFilter, ListTodo, Plus, Sparkles, Target } from 'lucide-react'
import { EmptyState } from '../components/UI'
import { dueLabel } from '../lib/intelligence'

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false
  const today = new Date()
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return task.dueDate < key
}

export default function Tasks({ records, onCapture, onSelect, onToggleTask }) {
  const [filter, setFilter] = useState('open')
  const [quickTask, setQuickTask] = useState('')
  const tasks = useMemo(() => records.filter((record) => record.type === 'task'), [records])
  const open = tasks.filter((task) => !task.completed)
  const done = tasks.filter((task) => task.completed)
  const overdue = open.filter(isOverdue)
  const completion = tasks.length ? Math.round(done.length / tasks.length * 100) : 0
  const filtered = tasks.filter((task) => filter === 'all' || (filter === 'open' && !task.completed) || (filter === 'done' && task.completed) || (filter === 'overdue' && isOverdue(task)))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const focus = [...open].sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))[0]
  const submit = () => { if (!quickTask.trim()) return; onCapture(`！${quickTask}`); setQuickTask('') }
  return <div className="page tasks-page">
    <div className="page-title-row"><div><span className="eyebrow">把想法变成行动</span><h1>待办事项</h1><p>不追求做更多，只专注于下一件重要的事。</p></div><div className="task-progress-summary"><span><CheckCircle2 size={16} />已完成 {done.length}</span><strong>{completion}%</strong></div></div>
    <div className="task-quick-add card"><span><Plus size={19} /></span><input value={quickTask} onChange={(event) => setQuickTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submit() }} placeholder="添加一件要做的事，例如：明天下午提交方案" /><small>回车快速添加</small><button className="button primary" disabled={!quickTask.trim()} onClick={submit}>添加待办<ArrowUpRight size={15} /></button></div>
    <div className="tasks-layout">
      <section className="task-list-card card"><div className="task-list-top"><div className="filter-tabs compact">{[['open', '待完成', open.length], ['overdue', '已逾期', overdue.length], ['done', '已完成', done.length], ['all', '全部', tasks.length]].map(([key, label, count]) => <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}<span>{count}</span></button>)}</div><ListFilter size={17} /></div>
        <div className="full-task-list">{filtered.map((task) => <div className={`full-task-row ${task.completed ? 'is-completed' : ''}`} key={task.id}><button className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={() => onToggleTask(task)}>{task.completed && <Check size={15} />}</button><button className="full-task-copy" onClick={() => onSelect(task)}><strong>{task.title}</strong><span><i className={`priority-dot ${task.priority}`} />{task.category}{task.tags.slice(0, 2).map((tag) => <em key={tag}>#{tag}</em>)}</span></button><div className={`task-due ${isOverdue(task) ? 'overdue' : ''}`}><CalendarDays size={14} /><span>{dueLabel(task.dueDate)}</span>{task.priority === 'high' && !task.completed && <i>优先</i>}</div><button className="icon-button row-open" onClick={() => onSelect(task)}><ChevronRight size={17} /></button></div>)}</div>
        {!filtered.length && <EmptyState icon={CheckCircle2} title={filter === 'done' ? '还没有已完成的待办' : '这一组很清爽'} text={filter === 'done' ? '完成一件任务后，它会出现在这里。' : '没有需要处理的事项，享受这一刻吧。'} />}
      </section>
      <aside className="task-side">
        <section className="focus-card"><div className="focus-label"><Target size={16} />今日焦点</div>{focus ? <><h2>{focus.title}</h2><p>{focus.summary}</p><div className="focus-meta"><span><Clock3 size={14} />{dueLabel(focus.dueDate)}</span><span><Flag size={14} />{focus.priority === 'high' ? '高优先级' : '普通优先级'}</span></div><button onClick={() => onSelect(focus)}>查看并推进<ArrowUpRight size={16} /></button></> : <><h2>今天没有待办压力</h2><p>所有事项都已妥善处理，可以留一点时间给新的想法。</p></>}</section>
        <section className="completion-card card"><div className="completion-ring" style={{ '--progress': `${completion * 3.6}deg` }}><div><strong>{completion}%</strong><span>完成率</span></div></div><div><h3>稳稳地推进</h3><p>共 {tasks.length} 件任务<br />已完成 {done.length} 件</p></div></section>
        <section className="task-tip"><Sparkles size={16} /><p><strong>一个轻松的小建议</strong>如果一件事超过半小时，试着先写下一个 10 分钟就能开始的动作。</p></section>
      </aside>
    </div>
  </div>
}
