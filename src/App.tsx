import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Issues } from './pages/Issues';
import { Votes } from './pages/Votes';
import { Community } from './pages/Community';
import { Events } from './pages/Events';
import { Settings } from './pages/Settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'issues':
        return <Issues />;
      case 'votes':
        return <Votes />;
      case 'community':
        return <Community />;
      case 'events':
        return <Events />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
