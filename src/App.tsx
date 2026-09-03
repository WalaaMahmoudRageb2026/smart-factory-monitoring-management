import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './lib/api';
import { Notification } from './types';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductionPage } from './pages/ProductionPage';
import { ProductionLinesPage } from './pages/ProductionLinesPage';
import { MachinesPage } from './pages/MachinesPage';
import { FaultsPage } from './pages/FaultsPage';
import { DowntimePage } from './pages/DowntimePage';
import { MaintenancePage } from './pages/MaintenancePage';
import { InventoryPage } from './pages/InventoryPage';
import { ProductsPage } from './pages/ProductsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { UsersPage } from './pages/UsersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch {
      // Gracefully handle transient connection errors
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 gap-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider font-semibold text-slate-500 dark:text-slate-400">
          {t('bootingOS')}
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab: NavigationTab) => setActiveTab(tab)} />;
      case 'production':
        return <ProductionPage />;
      case 'lines':
        return <ProductionLinesPage />;
      case 'machines':
        return <MachinesPage />;
      case 'faults':
        return <FaultsPage />;
      case 'downtime':
        return <DowntimePage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'inventory':
        return <InventoryPage />;
      case 'products':
        return <ProductsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'users':
        return <UsersPage />;
      case 'notifications':
        return <NotificationsPage onRefreshNotifs={fetchNotifications} />;
      case 'reports':
        return <ReportsPage />;
      case 'audit-logs':
      case 'audit':
        return <AuditLogsPage />;
      case 'security':
        return <SecuritySettingsPage />;
      default:
        return <DashboardPage onNavigate={(tab: NavigationTab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area with RTL aware margin/padding */}
      <div className={`flex-1 flex flex-col min-w-0 ${isRTL ? 'lg:pr-64 lg:pl-0' : 'lg:pl-64 lg:pr-0'}`}>
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-200">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

