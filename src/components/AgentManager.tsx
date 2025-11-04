import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Code, Globe, FileText, Plus, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  is_active: boolean;
}

interface AgentManagerProps {
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
}

const AGENT_TYPES = [
  { value: 'chat', label: 'Chat Assistant', icon: Bot },
  { value: 'research', label: 'Research Agent', icon: Sparkles },
  { value: 'code', label: 'Code Agent', icon: Code },
  { value: 'web_browser', label: 'Web Browser', icon: Globe },
  { value: 'file_processor', label: 'File Processor', icon: FileText },
  { value: 'custom', label: 'Custom Agent', icon: Plus },
];

const CAPABILITIES = [
  { value: 'web_search', label: 'Web Search' },
  { value: 'code_execution', label: 'Code Execution' },
  { value: 'file_processing', label: 'File Processing' },
  { value: 'web_browsing', label: 'Web Browsing' },
  { value: 'memory', label: 'Memory & Context' },
];

export function AgentManager({ selectedAgent, onSelectAgent }: AgentManagerProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    type: 'chat',
    description: '',
    capabilities: [] as string[],
  });

  useEffect(() => {
    if (user) {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAgents(data);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          capabilities: formData.capabilities,
        })
        .select()
        .single();

      if (error) throw error;

      setAgents([data, ...agents]);
      setFormData({ name: '', type: 'chat', description: '', capabilities: [] });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = (capability: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter((c) => c !== capability)
        : [...prev.capabilities, capability],
    }));
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Sign in to create and manage agents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Agents</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateAgent} className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="My Research Assistant"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {AGENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Describe what this agent does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capabilities
              </label>
              <div className="space-y-2">
                {CAPABILITIES.map((cap) => (
                  <label key={cap.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.includes(cap.value)}
                      onChange={() => toggleCapability(cap.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cap.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No agents yet</p>
            <p className="text-xs mt-1">Create your first AI agent above</p>
          </div>
        ) : (
          agents.map((agent) => {
            const TypeIcon = AGENT_TYPES.find((t) => t.value === agent.type)?.icon || Bot;
            const isSelected = selectedAgent?.id === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(isSelected ? null : agent)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  >
                    <TypeIcon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </div>
                    {agent.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {CAPABILITIES.find((c) => c.value === cap)?.label || cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
