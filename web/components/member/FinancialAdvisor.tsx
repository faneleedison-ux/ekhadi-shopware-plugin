'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from 'lucide-react'

interface Message {
  role: 'user' | 'bot'
  text: string
  emoji?: string
}

const QUICK_PROMPTS = [
  { label: '💰 How to save?', q: 'how do I save money?' },
  { label: '📊 Budget help', q: 'help me budget my grant' },
  { label: '💳 Avoid debt', q: 'how to avoid debt?' },
  { label: '⭐ Credit score', q: 'how to improve my credit score?' },
]

function formatAnswer(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('•')) {
      return (
        <li key={i} className="flex items-start gap-2 text-[13px] text-text-primary">
          <span className="text-primary mt-0.5 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </li>
      )
    }
    if (line === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-[13px] text-text-primary leading-snug"
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    )
  })
}

export default function FinancialAdvisor() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      emoji: '👋',
      text: "Hi! I'm your e-Khadi financial advisor. I can help you save money, budget your grant, and manage your credit wisely.\n\nWhat would you like help with?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [open, messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      const botMsg: Message = { role: 'bot', text: data.answer, emoji: data.emoji }
      setMessages((m) => [...m, botMsg])
      if (!open) setUnread((n) => n + 1)
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #1877F2, #0f4fa8)',
          boxShadow: '0 4px 20px rgba(24,119,242,0.5)',
        }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
          style={{ height: '480px', border: '1px solid rgba(24,119,242,0.2)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Financial Advisor</p>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Always here to help
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">{msg.emoji ?? '🤖'}</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-border rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-[13px] text-white">{msg.text}</p>
                  ) : (
                    <div className="space-y-0.5">
                      {formatAnswer(msg.text)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 bg-white border-t border-border flex gap-1.5 overflow-x-auto flex-shrink-0">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.q}
                onClick={() => send(p.q)}
                className="text-[10px] font-semibold text-primary bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 whitespace-nowrap hover:bg-primary/15 transition-colors flex-shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-border flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask a financial question..."
              className="flex-1 text-sm bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
            >
              {loading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}