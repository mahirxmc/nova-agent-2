import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Monitor, 
  MousePointer, 
  Eye, 
  Shield, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Search,
  Download,
  Upload,
  Camera,
  Keyboard
} from 'lucide-react';

interface BrowserTask {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'extract' | 'solve_captcha';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface BrowserControlProps {
  isVisible: boolean;
  onClose: () => void;
  onTaskComplete: (result: any) => void;
}

export function BrowserControl({ isVisible, onClose, onTaskComplete }: BrowserControlProps) {
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const [isConnected, setIsConnected] = useState(false);
  const [tasks, setTasks] = useState<BrowserTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [browserMode, setBrowserMode] = useState<'navigate' | 'automate' | 'visual'>('navigate');

  const predefinedTasks: Omit<BrowserTask, 'id' | 'status'>[] = [
    {
      type: 'navigate',
      description: 'Navigate to website',
    },
    {
      type: 'click',
      description: 'Click on element',
    },
    {
      type: 'type',
      description: 'Type text into field',
    },
    {
      type: 'screenshot',
      description: 'Take screenshot',
    },
    {
      type: 'extract',
      description: 'Extract content',
    },
    {
      type: 'solve_captcha',
      description: 'Solve captcha automatically',
    }
  ];

  const handleConnectBrowser = async () => {
    setIsConnected(true);
    // Simulate browser connection
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  };

  const addTask = (taskType: BrowserTask['type'], description: string) => {
    const newTask: BrowserTask = {
      id: Date.now().toString(),
      type: taskType,
      description,
      status: 'pending'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const executeTask = async (task: BrowserTask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'running' } : t
    ));

    // Simulate task execution with realistic timing
    const executionTime = Math.random() * 2000 + 1000; // 1-3 seconds
    
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? {
          ...t,
          status: success ? 'completed' : 'failed',
          result: success ? {
            data: 'Task completed successfully',
            timestamp: new Date().toISOString()
          } : undefined,
          error: success ? undefined : 'Task execution failed'
        } : t
      ));

      if (success) {
        onTaskComplete({
          taskId: task.id,
          type: task.type,
          result: 'Task completed successfully'
        });
      }
    }, executionTime);
  };

  const clearTasks = () => {
    setTasks([]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nova Browser Control</h2>
                <p className="text-sm text-orange-100">Advanced automation and visual problem-solving</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white' : 'bg-gray-300'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                {(['navigate', 'automate', 'visual'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBrowserMode(mode)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      browserMode === mode
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              
              {!isConnected && (
                <button
                  onClick={handleConnectBrowser}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Connect Browser
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRecording ? 'Stop Recording' : 'Record Actions'}
              </button>
              <button
                onClick={clearTasks}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Browser View */}
          <div className="flex-1 bg-gray-100 relative">
            <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Browser Address Bar */}
              <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
                <Globe className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="flex-1 px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter URL to navigate..."
                />
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Go
                </button>
              </div>

              {/* Browser Content */}
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {isConnected ? 'Browser Ready' : 'Connect Browser First'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConnected 
                      ? 'Select tasks to automate web interactions'
                      : 'Connect your browser to start automation'
                    }
                  </p>
                  
                  {browserMode === 'visual' && isConnected && (
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Visual Analysis Active</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">Captcha Detection</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Task Controls */}
          <div className="w-80 bg-white border-l">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800 mb-2">Automation Tasks</h3>
                <p className="text-xs text-gray-600">
                  Select tasks for automated execution
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {predefinedTasks.map((task, index) => (
                  <button
                    key={index}
                    onClick={() => addTask(task.type, task.description)}
                    disabled={!isConnected}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        {task.type === 'navigate' && <Globe className="w-4 h-4 text-orange-600" />}
                        {task.type === 'click' && <MousePointer className="w-4 h-4 text-orange-600" />}
                        {task.type === 'type' && <Keyboard className="w-4 h-4 text-orange-600" />}
                        {task.type === 'screenshot' && <Camera className="w-4 h-4 text-orange-600" />}
                        {task.type === 'extract' && <Search className="w-4 h-4 text-orange-600" />}
                        {task.type === 'solve_captcha' && <Shield className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800">{task.description}</div>
                        <div className="text-xs text-gray-500 capitalize">{task.type}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Queue */}
        {tasks.length > 0 && (
          <div className="border-t bg-gray-50 p-4 max-h-48 overflow-y-auto">
            <h4 className="font-medium text-gray-800 mb-3">Task Queue ({tasks.length})</h4>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'pending' ? 'bg-gray-400' :
                      task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      task.status === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{task.description}</div>
                      <div className="text-xs text-gray-500 capitalize">{task.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => executeTask(task)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Execute
                      </button>
                    )}
                    {task.status === 'running' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Running...</span>
                      </div>
                    )}
                    {task.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-xs">✓ Done</span>
                      </div>
                    )}
                    {task.status === 'failed' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <span className="text-xs">✗ Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}