import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TransactionModal } from './components/TransactionModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const { user, token, loading } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'register'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick Add/Edit Modal state
  const [modalState, setModalState] = useState({ isOpen: false, initialData: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenAdd = () => {
    setModalState({ isOpen: true, initialData: null });
  };

  const handleOpenEdit = (transaction) => {
    setModalState({ isOpen: true, initialData: transaction });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, initialData: null });
  };

  // Loading spinner during initial session check
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Starting Student Expense Tracker...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Landing / Login / Register
  if (!token || !user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView('register')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthView('register')}
        onLogin={() => setAuthView('login')}
      />
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        onQuickAddClick={handleOpenAdd}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 mt-4">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 min-w-0 pb-16">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onQuickAdd={handleOpenAdd}
              onNavigate={setActiveTab}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              onAddClick={handleOpenAdd}
              onEditClick={handleOpenEdit}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsPage
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsPage
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringPage
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarPage
              onQuickAdd={handleOpenAdd}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

      </div>

      {/* Global Quick Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalState.isOpen}
        initialData={modalState.initialData}
        onClose={handleCloseModal}
        onSaved={triggerRefresh}
      />

    </div>
  );
}

export default App;
