import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Lock, 
  Eye, 
  Globe,
  FileText,
  Settings,
  Scale,
  Target
} from 'lucide-react';

interface ComplianceRule {
  id: string;
  category: 'platform' | 'legal' | 'privacy' | 'safety' | 'ethical';
  title: string;
  description: string;
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastChecked: Date;
  action: string;
  evidence?: string;
}

interface ComplianceEngineProps {
  isVisible: boolean;
  onClose: () => void;
  currentAction?: string;
  onComplianceCheck: (result: ComplianceResult) => void;
}

interface ComplianceResult {
  isAllowed: boolean;
  violations: ComplianceRule[];
  warnings: ComplianceRule[];
  approvedActions: string[];
  riskScore: number; // 0-100, lower is safer
}

const platformRules: Omit<ComplianceRule, 'id' | 'status' | 'lastChecked'>[] = [
  // Platform Rules
  {
    category: 'platform',
    title: 'No Illegal Activities',
    description: 'Agent must not assist with illegal activities, hacking, or cybercrime',
    severity: 'critical',
    action: 'Block and report illegal requests'
  },
  {
    category: 'platform',
    title: 'Content Policy Compliance',
    description: 'Follow content policies - no hate speech, violence, or harmful content',
    severity: 'high',
    action: 'Filter inappropriate content and provide safe alternatives'
  },
  {
    category: 'platform',
    title: 'Platform Terms of Service',
    description: 'Adhere to all platform terms, conditions, and user agreements',
    severity: 'medium',
    action: 'Inform users about terms and compliance requirements'
  },
  // Legal Rules
  {
    category: 'legal',
    title: 'Data Protection (GDPR/CCPA)',
    description: 'Protect user data and privacy according to regional laws',
    severity: 'critical',
    action: 'Implement data protection measures and user consent flows'
  },
  {
    category: 'legal',
    title: 'Copyright Compliance',
    description: 'Respect intellectual property rights and fair use policies',
    severity: 'high',
    action: 'Provide attribution and respect content creators rights'
  },
  {
    category: 'legal',
    title: 'Accessibility Standards',
    description: 'Ensure accessibility for users with disabilities (ADA/WCAG)',
    severity: 'medium',
    action: 'Implement accessible design and provide alternative formats'
  },
  // Privacy Rules
  {
    category: 'privacy',
    title: 'Data Minimization',
    description: 'Collect only necessary data and provide data deletion options',
    severity: 'high',
    action: 'Implement privacy-by-design principles'
  },
  {
    category: 'privacy',
    title: 'Transparent Data Use',
    description: 'Clearly explain how user data is collected, used, and stored',
    severity: 'medium',
    action: 'Provide clear privacy policies and consent mechanisms'
  },
  // Safety Rules
  {
    category: 'safety',
    title: 'User Safety Protection',
    description: 'Protect users from harmful content and dangerous activities',
    severity: 'critical',
    action: 'Implement safety filters and warning systems'
  },
  {
    category: 'safety',
    title: 'Misinformation Prevention',
    description: 'Counteract false information and provide fact-based responses',
    severity: 'high',
    action: 'Cross-reference information and provide sources'
  },
  // Ethical Rules
  {
    category: 'ethical',
    title: 'Bias Mitigation',
    description: 'Reduce bias in responses and ensure fair treatment',
    severity: 'high',
    action: 'Implement bias detection and mitigation strategies'
  },
  {
    category: 'ethical',
    title: 'Human Autonomy',
    description: 'Preserve human decision-making and provide transparent assistance',
    severity: 'medium',
    action: 'Clearly indicate AI assistance and allow user override'
  }
];

export function ComplianceEngine({ isVisible, onClose, currentAction, onComplianceCheck }: ComplianceEngineProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'logs'>('dashboard');
  const [complianceHistory, setComplianceHistory] = useState<ComplianceResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const evaluateCompliance = async (action: string): Promise<ComplianceResult> => {
    setIsChecking(true);
    
    // Simulate compliance check
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const rules: ComplianceRule[] = platformRules.map((rule, index) => ({
      ...rule,
      id: `rule-${index}`,
      status: 'compliant' as const,
      lastChecked: new Date(),
      evidence: `Checked at ${new Date().toLocaleTimeString()}`
    }));

    // Simulate finding some violations/warnings based on action
    const violations: ComplianceRule[] = [];
    const warnings: ComplianceRule[] = [];

    const actionLower = action.toLowerCase();
    
    // Check for potentially problematic requests
    if (actionLower.includes('hack') || actionLower.includes('illegal') || actionLower.includes('virus')) {
      violations.push({
        ...rules[0],
        status: 'violation',
        evidence: 'Illegal activity detected in request'
      });
    }

    if (actionLower.includes('pirate') || actionLower.includes('steal') || actionLower.includes('copyright')) {
      violations.push({
        ...rules[4],
        status: 'violation',
        evidence: 'Copyright infringement detected'
      });
    }

    if (actionLower.includes('spam') || actionLower.includes('fake')) {
      warnings.push({
        ...rules[8],
        status: 'warning',
        evidence: 'Potential misinformation risk detected'
      });
    }

    const riskScore = (violations.length * 30) + (warnings.length * 15);
    const isAllowed = violations.length === 0;

    const result: ComplianceResult = {
      isAllowed,
      violations,
      warnings,
      approvedActions: isAllowed ? ['Action approved with no violations'] : [],
      riskScore
    };

    setComplianceHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 checks
    setIsChecking(false);
    
    return result;
  };

  const handleActionCheck = async (action: string) => {
    const result = await evaluateCompliance(action);
    onComplianceCheck(result);
  };

  const getStatusIcon = (status: ComplianceRule['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'violation':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ComplianceRule['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nova Compliance Engine</h2>
                <p className="text-sm text-green-100">Platform rules & safety monitoring</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {(['dashboard', 'rules', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <div className="h-full flex flex-col p-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Compliant</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {complianceHistory.filter(h => h.isAllowed).length}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Violations</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {complianceHistory.reduce((sum, h) => sum + h.violations.length, 0)}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Warnings</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 mt-1">
                    {complianceHistory.reduce((sum, h) => sum + h.warnings.length, 0)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Avg Risk</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {Math.round(complianceHistory.reduce((sum, h) => sum + h.riskScore, 0) / (complianceHistory.length || 1))}%
                  </div>
                </div>
              </div>

              {/* Live Check */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Live Compliance Check</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentAction || ''}
                    onChange={(e) => {/* Handle action input */}}
                    placeholder="Enter action or request to check compliance..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => currentAction && handleActionCheck(currentAction)}
                    disabled={!currentAction || isChecking}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isChecking ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Check
                  </button>
                </div>
              </div>

              {/* Recent History */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Compliance Checks</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {complianceHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No compliance checks yet</p>
                  ) : (
                    complianceHistory.map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                        <div className="flex items-center gap-3">
                          {history.isAllowed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {history.isAllowed ? 'Action Approved' : 'Action Blocked'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Risk Score: {history.riskScore}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {history.violations.length > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              {history.violations.length} violations
                            </span>
                          )}
                          {history.warnings.length > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                              {history.warnings.length} warnings
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid gap-4">
                {platformRules.map((rule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon('compliant')}
                        <div>
                          <h4 className="font-medium text-gray-800">{rule.title}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(rule.severity)}`}>
                        {rule.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">{rule.category}</span>
                      <span className="text-xs text-blue-600">{rule.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Compliance logs will appear here</p>
                <p className="text-sm">Detailed audit trail of all compliance checks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}