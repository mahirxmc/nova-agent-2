import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Upload as UploadIcon, Bot, User, LogOut, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AgentManager } from './AgentManager';
import { FileUpload } from './FileUpload';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  is_active: boolean;
}

interface ChatInterfaceProps {
  onShowAuth: () => void;
}

export function ChatInterface({ onShowAuth }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      createNewConversation();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        agent_id: selectedAgent?.id,
        title: 'New Conversation',
      })
      .select()
      .single();

    if (!error && data) {
      setConversationId(data.id);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !conversationId) return;

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    // Save user message
    if (user && conversationId) {
      await saveMessage('user', userMessage.content);
    }

    try {
      // Prepare messages for API
      const chatMessages = messages.concat(userMessage).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call chat-stream edge function
      const { data, error } = await supabase.functions.invoke('chat-stream', {
        body: {
          messages: chatMessages,
          agentId: selectedAgent?.id,
          conversationId,
        },
      });

      if (error) throw error;

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Parse streaming response
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.done) {
                break;
              }

              if (parsed.content) {
                fullResponse += parsed.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = fullResponse;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              continue;
            }
          }
        }
      }

      // Save assistant message
      if (user && conversationId && fullResponse) {
        await saveMessage('assistant', fullResponse);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setMessages([]);
      setConversationId(null);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">AI Agent Platform</h1>
            {user ? (
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onShowAuth}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Sign In"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>
          {user && (
            <p className="text-sm text-blue-100 truncate">{user.email}</p>
          )}
        </div>

        {/* Agent Manager */}
        <div className="flex-1 overflow-hidden">
          <AgentManager
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">
                {selectedAgent ? selectedAgent.name : 'AI Assistant'}
              </h2>
              <p className="text-xs text-gray-600">
                {selectedAgent?.description || 'General purpose AI assistant'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFileUpload(true)}
            disabled={!user}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon className="w-4 h-4" />
            Upload File
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Start a conversation
                </h3>
                <p className="text-sm text-gray-500">
                  {user
                    ? 'Send a message to begin chatting with the AI'
                    : 'Sign in to save your conversations'}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[56px] max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '56px',
                  maxHeight: '128px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isStreaming}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileUploaded={() => {
          // Optionally add a message about the uploaded file
        }}
      />
    </div>
  );
}
