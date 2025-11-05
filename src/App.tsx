import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatInterface } from '@/components/EnhancedChatInterface';
import { AuthModal } from '@/components/AuthModal';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatInterface onShowAuth={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
