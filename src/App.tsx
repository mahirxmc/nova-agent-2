import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NovaAgentPro } from '@/components/NovaAgentPro';
import { AuthModal } from '@/components/AuthModal';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NovaAgentPro onShowAuth={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
