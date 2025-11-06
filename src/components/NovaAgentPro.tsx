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
  Monitor,
  Eye,
  Globe,
  Code,
  FileText,
  Circle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Shield,
  Camera,
  MousePointer,
  Keyboard,
  Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload } from './FileUpload';
import { RealPlaywrightControl } from './RealPlaywrightControl';

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
  type: 'assistant' | 'researcher' | 'developer' | 'navigator';
  description: string;
  icon: React.ComponentType<any>;
  thinking_style: 'analytical' | 'deep' | 'fast';
  capabilities: string[];
  max_response_time: number;
  color: string;
}

interface NovaAgentProProps {
  onShowAuth: () => void;
}

export function NovaAgentPro({ onShowAuth }: NovaAgentProProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState<string[]>([]);
  const [showThinking, setShowThinking] = useState(true);
  const [navigatorMode, setNavigatorMode] = useState<'assistant' | 'browser' | 'research'>('assistant');
  const [isConnected, setIsConnected] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState(45);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showBrowserControl, setShowBrowserControl] = useState(false);
  const [navigatorConnected, setNavigatorConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Predefined agents matching the image design
  const agents: Agent[] = [
    {
      id: 'nova-general',
      name: 'Nova Assistant',
      type: 'assistant',
      description: 'Professional AI assistant with comprehensive thinking capabilities',
      icon: Bot,
      thinking_style: 'analytical',
      capabilities: ['Language Translation', 'Summarization', 'Creative Writing', 'Problem Solving'],
      max_response_time: 30,
      color: 'orange'
    },
    {
      id: 'nova-researcher',
      name: 'Nova Researcher',
      type: 'researcher',
      description: 'Deep research specialist with long-form thinking',
      icon: Globe,
      thinking_style: 'deep',
      capabilities: ['Research', 'Data Analysis', 'Report Generation', 'Fact Checking'],
      max_response_time: 60,
      color: 'blue'
    },
    {
      id: 'nova-coder',
      name: 'Nova Developer',
      type: 'developer',
      description: 'Expert coding assistant with fast problem-solving',
      icon: Code,
      thinking_style: 'fast',
      capabilities: ['Code Generation', 'Debugging', 'Architecture Design', 'Technical Analysis'],
      max_response_time: 20,
      color: 'green'
    },
    {
      id: 'nova-navigator',
      name: 'Nova Navigator',
      type: 'navigator',
      description: 'Browser automation specialist with visual problem-solving',
      icon: Target,
      thinking_style: 'fast',
      capabilities: ['Web Browsing', 'Task Automation', 'Captcha Handling', 'Visual Analysis'],
      max_response_time: 45,
      color: 'blue'
    }
  ];

  useEffect(() => {
    // Set default agent to Nova Assistant
    if (!selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, []);

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
    const startTime = Date.now();
    
    // Simulate different thinking patterns based on agent style
    switch (agent.thinking_style) {
      case 'fast':
        thinkingSteps.push('Quick pattern recognition...', 'Rapid solution synthesis...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      
      case 'deep':
        thinkingSteps.push('Systematic analysis initiated...', 'Evaluating logical structure...', 'Cross-referencing knowledge base...', 'Formulating structured response...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      
      case 'analytical':
        thinkingSteps.push('Systematic analysis initiated...', 'Evaluating logical structure...', 'Cross-referencing knowledge base...', 'Formulating structured response...');
        setThinkingProcess(prev => [...prev, ...thinkingSteps]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
    }

    const endTime = Date.now();
    setResponseTime(endTime - startTime);
    setIsThinking(false);
    return thinkingSteps;
  };

  const getConfidence = (): number => {
    if (selectedAgent?.id === 'nova-general') return 95;
    if (selectedAgent?.id === 'nova-coder') return 89;
    if (selectedAgent?.id === 'nova-navigator') return 90;
    if (selectedAgent?.id === 'nova-researcher') return 93;
    return 90 + Math.floor(Math.random() * 10); // 90-100%
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const agent = selectedAgent || agents[0];
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);
    setFeedbackGiven(false);

    // Start thinking process
    const thinkingSteps = await simulateThinking(agent, userMessage.content);
    const confidence = getConfidence();

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
        confidence: confidence,
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

      // Add timeout to prevent infinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('Request timeout - aborting');
        controller.abort();
      }, (agent.max_response_time + 10) * 1000);

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

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      if (reader) {
        const streamTimeoutId = setTimeout(() => {
          console.warn('Stream timeout - forcing completion');
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
        }, 60000);
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
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
            
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';
            
            for (const event of events) {
              const trimmedEvent = event.trim();
              if (!trimmedEvent || !trimmedEvent.startsWith('data: ')) continue;
              
              const dataString = trimmedEvent.replace(/^data:\s*/, '').trim();
              if (!dataString || dataString === '{}') continue;

              try {
                const parsed = JSON.parse(dataString);
                
                if (parsed.done) {
                  clearTimeout(streamTimeoutId);
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: fullResponse, isStreaming: false }
                        : msg
                    )
                  );
                  reader.releaseLock();
                  setLastResponseTime(responseTime / 1000);
                  return;
                } else if (parsed.content) {
                  fullResponse += parsed.content;
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: fullResponse, isStreaming: true }
                        : msg
                    )
                  );
                } else if (parsed.error) {
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
                console.warn('Failed to parse SSE data:', parseError);
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
      setSelectedAgent(agents[0]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const connectBrowser = async () => {
    setIsConnected(true);
    // In a real implementation, this would establish a Playwright connection
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
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
      {/* Left Sidebar - Agent Selection */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              <h1 className="text-xl font-bold">Nova Agent Pro</h1>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="AI Brain">
                <Brain className="w-4 h-4" />
              </button>
              {user ? (
                <button onClick={handleSignOut} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onShowAuth} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Sign In">
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Agent Selection */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Your AI Agent</h3>
          <div className="space-y-2">
            {agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              const AgentIcon = agent.icon;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-2 border-blue-300' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <AgentIcon className={`w-5 h-5 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.thinking_style === 'fast' ? 'bg-green-400' :
                      agent.thinking_style === 'deep' ? 'bg-blue-400' :
                      'bg-orange-400'
                    }`}></div>
                    <span className="text-xs text-gray-500 capitalize">
                      {agent.thinking_style.replace('_', ' ')} thinking
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Button */}
        <div className="p-4 border-t">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                {selectedAgent?.name || 'Nova Agent Pro'}
              </h2>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                {selectedAgent?.description || 'Your professional AI assistant'}
                {selectedAgent && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className={`w-2 h-2 rounded-full inline-block ${
                      selectedAgent.thinking_style === 'fast' ? 'bg-green-400' :
                      selectedAgent.thinking_style === 'deep' ? 'bg-blue-400' :
                      'bg-orange-400'
                    }`}></div>
                    <span className="capitalize">Fast</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Tabs for Nova Navigator */}
            {selectedAgent?.id === 'nova-navigator' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['assistant', 'browser', 'research'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setNavigatorMode(mode)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      navigatorMode === mode
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            )}
            
            {/* Control Icons */}
            <div className="flex items-center gap-2">
              {selectedAgent?.id === 'nova-navigator' && (
                <button 
                  onClick={() => setShowBrowserControl(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                  title="Screen"
                >
                  <Monitor className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Brain">
                <Brain className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Safe">
                <Shield className="w-4 h-4 text-gray-600" />
              </button>
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
                  {selectedAgent?.name || 'Nova Agent Pro'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {user
                    ? 'Start a conversation with your professional AI assistant'
                    : 'Sign in to save conversations and access premium features'}
                </p>
                <div className="space-y-4 text-left">
                  {selectedAgent?.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Circle className="w-1.5 h-1.5 fill-current text-gray-400" />
                      <span className="text-sm text-gray-700">{capability}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Improvements:</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div>• <strong>Continuous Learning:</strong> Learns from user interactions</div>
                      <div>• <strong>Error Correction:</strong> Corrects errors for accuracy</div>
                      <div>• <strong>User Feedback:</strong> Values feedback for improvement</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Feel free to ask me any questions or engage in a conversation. I'm here to help!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.thinking && message.thinking.length > 0 && showThinking && (
                  <ThinkingIndicator thinking={message.thinking} />
                )}
                
                <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 max-w-3xl">
                    <div className={`px-6 py-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                        : message.error
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-100 border border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {message.modelUsed && (
                              <>
                                <span className="capitalize font-medium">
                                  {message.modelUsed.replace('nova-', '').replace('-', ' ')}
                                </span>
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
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>

                    {message.role === 'assistant' && !message.error && !message.isStreaming && !feedbackGiven && (
                      <div className="flex items-center gap-2 mt-2 px-2">
                        <button 
                          onClick={() => setFeedbackGiven(true)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors" 
                          title="Good response"
                        >
                          <ThumbsUp className="w-3 h-3 text-gray-400" />
                        </button>
                        <button 
                          onClick={() => setFeedbackGiven(true)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors" 
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3 h-3 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Regenerate">
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

        {/* Input Area */}
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
            
            {/* Performance Metrics */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Thinking visible</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span>{selectedAgent?.thinking_style || 'analytical'} mode</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span>{lastResponseTime}s response time</span>
              </div>
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

      {/* Real Playwright Browser Control */}
      <RealPlaywrightControl
        isVisible={showBrowserControl}
        onClose={() => setShowBrowserControl(false)}
        onTaskComplete={(result) => {
          console.log('Browser task completed:', result);
          // Add task result to messages
          const taskMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ Browser task completed: ${JSON.stringify(result.result, null, 2)}`,
            timestamp: new Date(),
            modelUsed: 'nova-navigator',
            confidence: 95,
          };
          setMessages((prev) => [...prev, taskMessage]);
        }}
        onConnectionStatus={(connected) => {
          setNavigatorConnected(connected);
        }}
      />
    </div>
  );
}
