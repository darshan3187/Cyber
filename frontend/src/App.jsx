import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BadgeToast from './components/BadgeToast';

// Pages
import AnalysePage from './pages/AnalysePage';
import DashboardPage from './pages/DashboardPage';
import GameModePage from './pages/GameModePage';
import CommunityFeedPage from './pages/CommunityFeedPage';

// Lucide
import { ShieldAlert } from 'lucide-react';

const AppContent = () => {
  const { showToast } = useApp();

  return (
    <Router>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex flex-col flex-grow w-full max-w-full min-w-0">
          <Header />
          <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent">
            <Routes>
              <Route path="/" element={<Navigate to="/analyse" replace />} />
              <Route path="/analyse" element={<AnalysePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/game" element={<GameModePage />} />
              <Route path="/community" element={<CommunityFeedPage />} />
            </Routes>
          </main>
        </div>
        
        {showToast && (
          <BadgeToast 
            title={showToast.title} 
            message={showToast.message} 
            type={showToast.type} 
          />
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
