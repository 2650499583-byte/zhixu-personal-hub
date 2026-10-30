import React, { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowUpRight, BookOpen, BrainCircuit, Check, ChevronRight, Clock3, FileText, Lightbulb, Link2, ListTodo, MessageCircleMore, Plus, RotateCcw, ShieldCheck, Sparkles, User, WandSparkles } from 'lucide-react'
import { TypeIcon } from '../components/UI'
import { answerQuestion, uid } from '../lib/intelligence'

const SUGGESTIONS = [
  { icon: ListTodo, text: '我今天最应该关注什么？', hint: '梳理优先级' },
  { icon: BookOpen, text: '总结一下我最近的阅读笔记', hint: '提炼重点' },
  { icon: Lightbulb, text: '我记录过哪些产品灵感？', hint: '找回灵感' },
  { icon: WandSparkles, text: '帮我回顾这一周的记录', hint: '阶段总结' },
]

export default function Assistant({ records, messages, setMessages, initialPrompt, onSelect }) {
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)
  const lastPrompt = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])
  const send = (text) => {
    const clean = (text || input).trim()
    if (!clean || thinking) return
    const userMessage = { id: uid(), role: 'user', text: clean, createdAt: new Date().toISOString() }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setThinking(true)
    window.setTimeout(() => {
      const answer = answerQuestion(clean, records)
      setMessages((current) => [...current, { id: uid(), role: 'assistant', text: answer.text, sourceIds: answer.sources.map((source) => source.id), createdAt: new Date().toISOString() }])
      setThinking(false)
    }, 650)
  }
  useEffect(() => {
    if (initialPrompt?.text && initialPrompt.id !== lastPrompt.current) {
      lastPrompt.current = initialPrompt.id
      send(initialPrompt.text)
    }
  }, [initialPrompt])
  return <div className="assistant-page">
    <div className="assistant-main">
      <div className="assistant-header"><div><span className="assistant-avatar"><Sparkles size={20} /></span><div><h1>知序助手</h1><p><i />基于你的 {records.length} 条内容提供线索</p></div></div><button className="button secondary small" onClick={() => { if (!messages.length || window.confirm('清空当前对话？你的记录不会受到影响。')) setMessages([]) }}><RotateCcw size={14} />新对话</button></div>
      <div className="chat-scroll">
        <div className="chat-welcome"><span className="welcome-spark"><BrainCircuit size={28} /></span><h2>你的信息，可以换一种方式被看见。</h2><p>问我任何问题，我会从你的记录中寻找答案、整理重点，并给出可追溯的来源。</p></div>
        {!messages.length && <div className="suggestion-grid">{SUGGESTIONS.map(({ icon: Icon, text, hint }) => <button key={text} onClick={() => send(text)}><span><Icon size={18} /></span><strong>{text}</strong><small>{hint}<ArrowUpRight size={14} /></small></button>)}</div>}
        <div className="message-list">{messages.map((message) => <div className={`message ${message.role}`} key={message.id}>{message.role === 'assistant' ? <span className="message-avatar"><Sparkles size={16} /></span> : null}<div className="message-body"><div className="message-bubble">{message.text.split('\n').map((line, index) => <React.Fragment key={index}>{line}{index < message.text.split('\n').length - 1 && <br />}</React.Fragment>)}</div>{message.sourceIds?.length > 0 && <div className="message-sources"><span>参考了 {message.sourceIds.length} 条记录</span><div>{message.sourceIds.map((id) => { const record = records.find((item) => item.id === id); return record ? <button key={id} onClick={() => onSelect(record)}><TypeIcon type={record.type} size={13} /><span>{record.title}</span><ArrowUpRight size={13} /></button> : null })}</div></div>}</div>{message.role === 'user' ? <span className="user-avatar"><User size={15} /></span> : null}</div>)}</div>
        {thinking && <div className="message assistant"><span className="message-avatar"><Sparkles size={16} /></span><div className="thinking-bubble"><i /><i /><i /><span>正在梳理你的内容</span></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-composer"><div className="chat-input-wrap"><textarea rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder="问问你的记录，或让它帮你整理…" /><button disabled={!input.trim() || thinking} onClick={() => send()}><ArrowUp size={18} /></button></div><p>本地智能检索 · 回答会附上来源，重要信息请查看原文确认</p></div>
    </div>
    <aside className="assistant-context">
      <section><span className="eyebrow">当前知识范围</span><h3>你的个人内容库</h3><div className="context-stat"><strong>{records.length}</strong><span>条可检索记录</span></div><div className="context-types"><div><Lightbulb size={15} /><span>想法</span><strong>{records.filter((item) => item.type === 'idea').length}</strong></div><div><FileText size={15} /><span>资料</span><strong>{records.filter((item) => item.type === 'note' || item.type === 'link').length}</strong></div><div><ListTodo size={15} /><span>待办</span><strong>{records.filter((item) => item.type === 'task').length}</strong></div></div></section>
      <section><span className="eyebrow">你可以这样问</span><div className="context-questions">{['关于某个主题，我记过什么？', '哪些待办有明确日期？', '把相关内容串起来讲讲', '最近有哪些值得继续的想法？'].map((question) => <button key={question} onClick={() => send(question)}>{question}<ChevronRight size={14} /></button>)}</div></section>
      <div className="privacy-note"><ShieldCheck size={18} /><p><strong>你的内容由你掌握</strong>当前版本仅在浏览器中处理与保存，不会上传个人信息。</p></div>
    </aside>
  </div>
}
