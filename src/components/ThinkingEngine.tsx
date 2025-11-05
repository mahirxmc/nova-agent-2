import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  Target, 
  Layers, 
  Lightbulb, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

interface ThinkingStep {
  id: string;
  type: 'analysis' | 'reasoning' | 'planning' | 'execution' | 'validation' | 'reflection';
  content: string;
  confidence: number;
  duration: number;
  status: 'thinking' | 'completed' | 'skipped';
  reasoning: string;
  connections: string[];
}

interface ThinkingSession {
  id: string;
  task: string;
  steps: ThinkingStep[];
  currentStep: number;
  mode: 'fast' | 'deep' | 'creative' | 'analytical';
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
}

interface ThinkingEngineProps {
  isVisible: boolean;
  currentTask?: string;
  onThinkingComplete: (results: any) => void;
  mode?: 'fast' | 'deep' | 'creative' | 'analytical';
}

const thinkingPatterns = {
  fast: {
    name: 'Fast Thinking',
    description: 'Quick intuitive responses with rapid pattern recognition',
    icon: Zap,
    color: 'green',
    maxSteps: 3,
    stepDuration: 500
  },
  deep: {
    name: 'Deep Thinking',
    description: 'Comprehensive analysis with thorough exploration',
    icon: Brain,
    color: 'blue',
    maxSteps: 8,
    stepDuration: 2000
  },
  creative: {
    name: 'Creative Thinking',
    description: 'Innovative problem-solving with imaginative approaches',
    icon: Lightbulb,
    color: 'purple',
    maxSteps: 6,
    stepDuration: 1500
  },
  analytical: {
    name: 'Analytical Thinking',
    description: 'Systematic logical reasoning with structured approach',
    icon: Target,
    color: 'orange',
    maxSteps: 7,
    stepDuration: 1200
  }
};

export function ThinkingEngine({ isVisible, currentTask, onThinkingComplete, mode = 'analytical' }: ThinkingEngineProps) {
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<ThinkingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ThinkingSession | null>(null);
  const [showConnections, setShowConnections] = useState(true);

  const generateThinkingSteps = (task: string, thinkingMode: ThinkingSession['mode']): ThinkingStep[] => {
    const pattern = thinkingPatterns[thinkingMode];
    const steps: ThinkingStep[] = [];
    
    const analysisPrompts = {
      fast: ['Quick pattern recognition', 'Key insight identification', 'Immediate solution path'],
      deep: ['Comprehensive problem breakdown', 'Multiple perspective analysis', 'Systematic evaluation', 'Risk assessment', 'Long-term implications'],
      creative: ['Divergent thinking exploration', 'Unconventional idea generation', 'Creative synthesis', 'Innovation synthesis'],
      analytical: ['Logical structure mapping', 'Hypothesis formation', 'Evidence evaluation', 'Systematic reasoning', 'Conclusion synthesis']
    };

    const reasoningPrompts = {
      fast: ['Rapid inference based on patterns', 'Quick logical connection'],
      deep: ['Detailed causal relationships', 'Complex logical chains', 'Multi-layered reasoning'],
      creative: ['Abstract concept bridging', 'Creative analogy formation', 'Innovative connection patterns'],
      analytical: ['Formal logical progression', 'Structured argument development', 'Systematic inference']
    };

    for (let i = 0; i < pattern.maxSteps; i++) {
      const stepType = i === 0 ? 'analysis' : 
                      i === pattern.maxSteps - 1 ? 'validation' : 
                      i % 2 === 0 ? 'reasoning' : 'planning';
                      
      const prompts = stepType === 'analysis' ? analysisPrompts[thinkingMode] : 
                     stepType === 'reasoning' ? reasoningPrompts[thinkingMode] :
                     ['Strategic planning', 'Solution refinement'];

      const content = prompts[i % prompts.length];
      
      steps.push({
        id: `${Date.now()}-${i}`,
        type: stepType,
        content,
        confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
        duration: pattern.stepDuration,
        status: 'thinking',
        reasoning: `Applying ${thinkingMode} reasoning for: ${content}`,
        connections: i > 0 ? [`Step ${i}: ${steps[i-1].content}`] : []
      });
    }

    return steps;
  };

  const startThinkingSession = (task: string, thinkingMode: ThinkingSession['mode']) => {
    const steps = generateThinkingSteps(task, thinkingMode);
    const session: ThinkingSession = {
      id: Date.now().toString(),
      task,
      steps,
      currentStep: 0,
      mode: thinkingMode,
      isActive: true,
      startTime: new Date()
    };

    setCurrentSession(session);
    setSessions(prev => [...prev, session]);
    setIsActive(true);

    // Execute thinking steps
    executeThinkingSteps(session, 0);
  };

  const executeThinkingSteps = async (session: ThinkingSession, stepIndex: number) => {
    if (stepIndex >= session.steps.length) {
      // Thinking session complete
      const completedSession = { ...session, isActive: false, endTime: new Date() };
      setCurrentSession(completedSession);
      setSessions(prev => prev.map(s => s.id === session.id ? completedSession : s));
      setIsActive(false);

      onThinkingComplete({
        sessionId: session.id,
        steps: session.steps,
        totalDuration: Date.now() - session.startTime.getTime(),
        averageConfidence: session.steps.reduce((sum, step) => sum + step.confidence, 0) / session.steps.length
      });
      return;
    }

    const currentStep = session.steps[stepIndex];
    
    // Simulate thinking time
    setTimeout(() => {
      setCurrentSession(prev => prev ? {
        ...prev,
        steps: prev.steps.map((step, index) => 
          index === stepIndex ? { ...step, status: 'completed' } : step
        )
      } : null);

      // Continue to next step
      executeThinkingSteps(session, stepIndex + 1);
    }, currentStep.duration);
  };

  const skipCurrentStep = () => {
    if (!currentSession) return;
    
    const currentStep = currentSession.steps[currentSession.currentStep];
    if (currentStep) {
      setCurrentSession(prev => prev ? {
        ...prev,
        steps: prev.steps.map((step, index) => 
          index === currentSession.currentStep ? { ...step, status: 'skipped' } : step
        )
      } : null);
      
      executeThinkingSteps(currentSession, currentSession.currentStep + 1);
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setIsActive(false);
  };

  if (!isVisible) return null;

  const currentPattern = currentSession ? thinkingPatterns[currentSession.mode] : thinkingPatterns[mode];

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r from-${currentPattern.color}-600 to-${currentPattern.color}-700 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <currentPattern.icon className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">{currentPattern.name}</h3>
              <p className="text-xs text-gray-100">
                {currentSession ? `${currentSession.currentStep + 1}/${currentSession.steps.length} steps` : 'Ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentSession && isActive && (
              <>
                <button
                  onClick={skipCurrentStep}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Skip current step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={resetSession}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTask && !currentSession && (
        <div className="p-4 border-b bg-gray-50">
          <button
            onClick={() => startThinkingSession(currentTask, mode)}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-${currentPattern.color}-600 text-white rounded-lg hover:bg-${currentPattern.color}-700 transition-colors`}
          >
            <Play className="w-4 h-4" />
            Start {currentPattern.name}
          </button>
        </div>
      )}

      {/* Current Session */}
      {currentSession && (
        <div className="max-h-96 overflow-y-auto">
          {/* Task Description */}
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-800 font-medium">{currentSession.task}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Mode: {currentSession.mode}</span>
              <span>•</span>
              <span>Confidence: {Math.round(currentSession.steps.reduce((sum, step) => sum + step.confidence, 0) / currentSession.steps.length)}%</span>
            </div>
          </div>

          {/* Thinking Steps */}
          <div className="p-4 space-y-3">
            {currentSession.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index > 0 && showConnections && (
                  <div className="absolute -top-1 left-5 w-0.5 h-4 bg-gray-200"></div>
                )}

                <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                  step.status === 'thinking' ? 'border-blue-200 bg-blue-50' :
                  step.status === 'completed' ? 'border-green-200 bg-green-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {step.status === 'thinking' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 text-white animate-spin" />
                      </div>
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {step.status === 'skipped' && (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {step.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {step.confidence}% confident
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{step.content}</p>
                    
                    {step.status === 'completed' && (
                      <p className="text-xs text-gray-600 mt-1 italic">{step.reasoning}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Step {currentSession.currentStep + 1} of {currentSession.steps.length}</span>
              <span>
                {currentSession.steps.filter(s => s.status === 'completed').length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className={`bg-${currentPattern.color}-500 h-1.5 rounded-full transition-all duration-300`}
                style={{ 
                  width: `${(currentSession.steps.filter(s => s.status === 'completed').length / currentSession.steps.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}