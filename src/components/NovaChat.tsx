'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent?: string
  model?: string
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

const agents: Agent[] = [
  {
    id: 'nova-assistant',
    name: 'Nova Assistant',
    description: 'Helpful AI assistant for general tasks',
    icon: '🤖',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'researcher',
    name: 'Nova Researcher',
    description: 'Expert researcher with detailed analysis',
    icon: '🔍',
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'developer',
    name: 'Nova Developer',
    description: 'Expert programmer and code solutions',
    icon: '💻',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'navigator',
    name: 'Nova Navigator',
    description: 'Information organization and navigation',
    icon: '🧭',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'creator',
    name: 'Nova Creator',
    description: 'Creative content and idea generation',
    icon: '🎨',
    color: 'from-pink-500 to-rose-600'
  }
]

export default function NovaChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0])
  const [streamingMessage, setStreamingMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input.trim() }],
          agent: selectedAgent.id,
          model: 'llama-3.3-70b-versatile'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  accumulatedContent += data.content
                  setStreamingMessage(accumulatedContent)
                }
                if (data.done) {
                  setStreamingMessage('')
                }
              } catch (e) {
                // Ignore parsing errors for SSE
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulatedContent,
        agent: selectedAgent.name,
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessage('')

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        agent: selectedAgent.name,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setStreamingMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Agent Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Agent</h1>
          <p className="text-sm text-gray-600">Choose your AI assistant</p>
        </div>

        <div className="space-y-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedAgent.id === agent.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl`}>
                  {agent.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Powered by GroqCloud</span>
          </div>
          <p className="text-sm opacity-90">Llama 3.3 70B - Ultra-fast AI responses</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${selectedAgent.color} flex items-center justify-center text-white`}>
                {selectedAgent.icon}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{selectedAgent.name}</h2>
                <p className="text-sm text-gray-600">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Bot className="w-4 h-4" />
              <span>GroqCloud AI</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${selectedAgent.color} flex items-center justify-center text-white text-3xl mx-auto mb-4`}>
                {selectedAgent.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Nova Agent</h3>
              <p className="text-gray-600">Start a conversation with {selectedAgent.name}</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : `bg-gradient-to-r ${selectedAgent.color} text-white`
                }`}>
                  {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  {message.agent && message.role === 'assistant' && (
                    <p className="text-xs font-semibold mb-2 opacity-75">{message.agent}</p>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingMessage && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${selectedAgent.color} flex items-center justify-center text-white`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-lg bg-white border border-gray-200 text-gray-900">
                  <p className="text-xs font-semibold mb-2 text-gray-500">{selectedAgent.name}</p>
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${selectedAgent.name}...`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}