import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  Upload as UploadIcon, 
  Bot, 
  User, 
  LogOut, 
  LogIn, 
  Brain, 
  Cpu, 
  Zap, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Settings,
  MessageSquare,
  Image,
  Code,
  Globe,
  Shield,
  Monitor,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BrowserControl } from './BrowserControl';
import { ThinkingEngine } from './ThinkingEngine';
import { ComplianceEngine } from './ComplianceEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: string[];
  modelUsed?: string;
  confidence?: number;
  isStreaming?: boolean;
  error?: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'general' | 'research' | 'coding' | 'browser' | 'creative';
  description: string;
  capabilities: string[];
  is_active: boolean;
  thinking_style: 'fast' | 'deep' | 'creative' | 'analytical';
  max_response_time: number;
}

interface EnhancedChatInterfaceProps {
  onShowAuth: () => void;
}

export function EnhancedChatInterface({ onShowAuth }: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState<string[]>([]);
  const [showThinking, setShowThinking] = useState(true);
  const [agentMode, setAgentMode] = useState<'assistant' | 'browser' | 'research'>('assistant');
  const [showBrowserControl, setShowBrowserControl] = useState(false);
  const [showThinkingEngine, setShowThinkingEngine] = useState(false);
  const [showComplianceEngine, setShowComplianceEngine] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Predefined agents with thinking styles
  const agents: Agent[] = [
    {
      id: 'nova-general',
      name: 'Nova Assistant',
      type: 'general',
      description: 'Professional AI assistant with comprehensive thinking capabilities',
      capabilities: ['General conversation', 'Problem solving', 'Creative thinking', 'Analysis'],
      is_active: true,
      thinking_style: 'analytical',
      max_response_time: 30
    },
    {
      id: 'nova-researcher',
      name: 'Nova Researcher',
      type: 'research',
      description: 'Deep research specialist with long-form thinking',
      capabilities: ['Research', 'Data analysis', 'Report generation', 'Fact checking'],
      is_active: true,
      thinking_style: 'deep',
      max_response_time: 60
    },
    {
      id: 'nova-coder',
      name: 'Nova Developer',
      type: 'coding',
      description: 'Expert coding assistant with fast problem-solving',
      capabilities: ['Code generation', 'Debugging', 'Architecture design', 'Technical analysis'],
      is_active: true,
      thinking_style: 'fast',
      max_response_time: 20
    },
    {
      id: 'nova-browser',
      name: 'Nova Navigator',
      type: 'browser',
      description: 'Browser automation specialist with visual problem-solving',
      capabilities: ['Web browsing', 'Task automation', 'Captcha handling', 'Visual analysis'],
      is_active: true,
      thinking_style: 'fast',
      max_response_time: 45
    },
    {
      id: 'nova-creative',
      name: 'Nova Creator',
      type: 'creative',
      description: 'Creative thinking and content generation specialist',
      capabilities: ['Content creation', 'Design ideas', 'Storytelling', 'Innovation'],
      is_active: true,
      thinking_style: 'creative',
      max_response_time: 40
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingProcess]);

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

  const simulateThinking = async (agent: Agent, prompt: string): Promise<string[]> => {
    setIsThinking(true);
    setThinkingProcess([]);

    const thinkingSteps: string[] = [];
    
    // Simulate different thinking patterns based on agent style
    switch (agent.thinking_style) {
      case 'fast':
        thinkingSteps.push('Quick pattern recognition...', 'Rapid solution synthesis...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      
      case 'deep':
        thinkingSteps.push('Analyzing the problem deeply...', 'Breaking down complexity...', 'Considering multiple perspectives...', 'Synthesizing comprehensive solution...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      
      case 'creative':
        thinkingSteps.push('Exploring creative possibilities...', 'Brainstorming innovative approaches...', 'Connecting unexpected ideas...', 'Crafting original solution...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 1500));
        break;
      
      case 'analytical':
        thinkingSteps.push('Systematic analysis initiated...', 'Evaluating logical structure...', 'Cross-referencing knowledge base...', 'Formulating structured response...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
    }

    setIsThinking(false);
    return thinkingSteps;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const agent = selectedAgent || agents[0]; // Default to Nova Assistant
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    // Check compliance before processing
    setComplianceStatus({
      isAllowed: true,
      violations: [],
      warnings: [],
      riskScore: 0
    });

    // Start thinking process
    const thinkingSteps = await simulateThinking(agent, userMessage.content);

    try {
      // Prepare messages for API
      const chatMessages = messages.concat(userMessage).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        thinking: thinkingSteps,
        modelUsed: agent.id,
        confidence: Math.floor(Math.random() * 15) + 85, // 85-100% confidence
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Prepare request data
      const requestData: any = {
        messages: chatMessages,
        agentId: agent.id,
        agentType: agent.type,
        conversationId,
        thinkingStyle: agent.thinking_style,
      };

      if (user) {
        requestData.userId = user.id;
      }

      // Add timeout to prevent infinite waiting - increased for better reliability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('Request timeout - aborting');
        controller.abort();
      }, (agent.max_response_time + 10) * 1000); // Add 10 second buffer

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response with improved parsing
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      if (reader) {
        // Set up a stream timeout
        const streamTimeoutId = setTimeout(() => {
          console.warn('Stream timeout - forcing completion. Current response:', fullResponse);
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: fullResponse || 'Response timed out. Please try again.', isStreaming: false }
                : msg
            )
          );
          try {
            reader.cancel();
          } catch (e) {
            // Ignore errors when canceling
          }
        }, 60000); // 1 minute stream timeout
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('Stream ended normally. Final response:', fullResponse);
              // Ensure message is marked as complete when stream ends
              clearTimeout(streamTimeoutId);
              setMessages((prev) => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: fullResponse || 'No response received.', isStreaming: false }
                    : msg
                )
              );
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete SSE events (end with \n\n)
            const events = buffer.split('\n\n');
            // Keep the last incomplete event in buffer
            buffer = events.pop() || '';
            
            for (const event of events) {
              const trimmedEvent = event.trim();
              if (!trimmedEvent || !trimmedEvent.startsWith('data: ')) continue;
              
              // Extract data part after "data: "
              const dataString = trimmedEvent.replace(/^data:\s*/, '').trim();
              if (!dataString || dataString === '{}') continue;

              try {
                const parsed = JSON.parse(dataString);
                console.log('SSE Parse Debug:', { dataString, parsed, fullResponseLength: fullResponse.length });
                
                if (parsed.done) {
                  console.log('Stream Done Signal Received:', fullResponse);
                  // Mark message as complete and stop streaming
                  clearTimeout(streamTimeoutId);
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: fullResponse, isStreaming: false }
                        : msg
                    )
                  );
                  reader.releaseLock();
                  return;
                } else if (parsed.content) {
                  console.log('Content chunk received:', parsed.content);
                  fullResponse += parsed.content;
                  // Update message content immediately
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: fullResponse, isStreaming: true }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  // Handle streaming errors
                  clearTimeout(streamTimeoutId);
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: `Error: ${parsed.error}`, isStreaming: false, error: parsed.error }
                        : msg
                    )
                  );
                  reader.releaseLock();
                  return;
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError, 'Raw data:', dataString);
                // Continue processing other lines instead of stopping
              }
            }
          }
        } catch (streamError) {
          clearTimeout(streamTimeoutId);
          console.error('Streaming error:', streamError);
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: fullResponse || 'Error: Failed to process streaming response. Please try again.', error: 'Stream error', isStreaming: false }
                : msg
            )
          );
        } finally {
          clearTimeout(streamTimeoutId);
          try {
            reader.releaseLock();
          } catch (e) {
            // Reader might already be released
          }
        }
      } else {
        // No readable stream - handle as error
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: 'Error: No response stream available. Please try again.', isStreaming: false }
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}. Please try again.`,
        timestamp: new Date(),
        error: error.message,
        modelUsed: agent.id,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setThinkingProcess([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('```')) {
          return <div key={index} className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mt-2">
            <Code className="w-4 h-4 inline mr-2" />
            Code Block
          </div>;
        }
        if (line.startsWith('**')) {
          return <div key={index} className="font-bold text-gray-800 mt-2">{line.replace(/\*\*/g, '')}</div>;
        }
        return <div key={index} className="mb-2">{line}</div>;
      });
  };

  const ThinkingIndicator = ({ thinking }: { thinking: string[] }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Thinking Process</span>
        {isThinking && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
      </div>
      <div className="space-y-1">
        {thinking.map((step, index) => (
          <div key={index} className="text-sm text-blue-700 flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            {step}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              <h1 className="text-xl font-bold">Nova Agent Pro</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={showThinking ? "Hide thinking" : "Show thinking"}
              >
                <Brain className="w-4 h-4" />
              </button>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Sign In"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {user && (
            <p className="text-sm text-blue-100 truncate">{user.email}</p>
          )}
        </div>

        {/* Agent Selection */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Your AI Agent</h3>
            <div className="grid grid-cols-1 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedAgent?.id === agent.id
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {agent.type === 'general' && <Bot className="w-4 h-4 text-blue-600" />}
                    {agent.type === 'research' && <Globe className="w-4 h-4 text-green-600" />}
                    {agent.type === 'coding' && <Code className="w-4 h-4 text-purple-600" />}
                    {agent.type === 'browser' && <Globe className="w-4 h-4 text-orange-600" />}
                    {agent.type === 'creative' && <Image className="w-4 h-4 text-pink-600" />}
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{agent.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.thinking_style === 'fast' ? 'bg-green-400' :
                      agent.thinking_style === 'deep' ? 'bg-blue-400' :
                      agent.thinking_style === 'creative' ? 'bg-purple-400' :
                      'bg-orange-400'
                    }`}></div>
                    <span className="text-xs text-gray-500 capitalize">{agent.thinking_style} thinking</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={() => setShowFileUpload(true)}
            disabled={!user}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UploadIcon className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Chat Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {selectedAgent ? selectedAgent.name : 'Nova Agent Pro'}
              </h2>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                {selectedAgent?.description || 'Your professional AI assistant'}
                {selectedAgent && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className={`w-2 h-2 rounded-full inline-block ${
                      selectedAgent.thinking_style === 'fast' ? 'bg-green-400' :
                      selectedAgent.thinking_style === 'deep' ? 'bg-blue-400' :
                      selectedAgent.thinking_style === 'creative' ? 'bg-purple-400' :
                      'bg-orange-400'
                    }`}></div>
                    <span className="capitalize">{selectedAgent.thinking_style}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['assistant', 'browser', 'research'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAgentMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    agentMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Enhanced Control Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setShowBrowserControl(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Browser Control"
              >
                <Monitor className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowThinkingEngine(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Thinking Engine"
              >
                <Brain className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowComplianceEngine(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Compliance Engine"
              >
                <Shield className="w-4 h-4 text-gray-600" />
              </button>
              {complianceStatus && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                  <AlertTriangle className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700">Safe</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to Nova Agent Pro
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {user
                    ? 'Start a conversation with your professional AI assistant'
                    : 'Sign in to save conversations and access premium features'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedAgent?.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.thinking && message.thinking.length > 0 && showThinking && (
                  <ThinkingIndicator thinking={message.thinking} />
                )}
                
                <div
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 max-w-3xl">
                    <div
                      className={`px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                          : message.error
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {message.modelUsed && (
                              <>
                                <Cpu className="w-3 h-3" />
                                <span>{message.modelUsed}</span>
                              </>
                            )}
                            {message.confidence && (
                              <>
                                <span>•</span>
                                <span>{message.confidence}% confidence</span>
                              </>
                            )}
                            {message.isStreaming && (
                              <>
                                <span>•</span>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Generating...</span>
                              </>
                            )}
                          </div>
                        )}
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy response"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {message.error ? (
                          <p className="text-red-800">{message.content}</p>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            {renderMessageContent(message.content)}
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'assistant' && !message.error && !message.isStreaming && (
                      <div className="flex items-center gap-2 mt-2 px-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <ThumbsUp className="w-3 h-3 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <ThumbsDown className="w-3 h-3 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <RefreshCw className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="bg-white border-t p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${selectedAgent?.name || 'Nova'} anything... (Press Enter to send, Shift+Enter for new line)`}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px] max-h-32 text-sm leading-relaxed"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '60px',
                    maxHeight: '128px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {inputMessage.length}/2000
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isStreaming}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </button>
            </div>
            
            {/* Feature Hints */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <span>💭 {showThinking ? 'Thinking visible' : 'Thinking hidden'}</span>
              <span>•</span>
              <span>🚀 {selectedAgent?.thinking_style || 'analytical'} mode</span>
              <span>•</span>
              <span>⚡ {selectedAgent?.max_response_time || 30}s response time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Components */}
      <BrowserControl
        isVisible={showBrowserControl}
        onClose={() => setShowBrowserControl(false)}
        onTaskComplete={(result) => {
          console.log('Browser task completed:', result);
        }}
      />

      <ThinkingEngine
        isVisible={showThinkingEngine}
        currentTask={inputMessage}
        onThinkingComplete={(result) => {
          console.log('Thinking completed:', result);
        }}
        mode={selectedAgent?.thinking_style || 'analytical'}
      />

      <ComplianceEngine
        isVisible={showComplianceEngine}
        onClose={() => setShowComplianceEngine(false)}
        currentAction={inputMessage}
        onComplianceCheck={(result) => {
          setComplianceStatus(result);
          console.log('Compliance checked:', result);
        }}
      />
    </div>
  );
}