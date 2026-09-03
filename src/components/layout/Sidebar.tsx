import React from 'react';
import {
  LayoutDashboard,
  Factory,
  Layers,
  Cpu,
  AlertOctagon,
  Timer,
  Wrench,
  Boxes,
  Package,
  Users,
  FileBarChart,
  Bell,
  ShieldCheck,
  ClipboardList,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  LogOut,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CountryLanguageSelector } from '../common/CountryLanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';
import { UserRole } from '../../types';

export type NavigationTab =
  | 'dashboard'
  | 'production'
  | 'lines'
  | 'machines'
  | 'faults'
  | 'downtime'
  | 'maintenance'
  | 'inventory'
  | 'products'
  | 'employees'
  | 'reports'
  | 'notifications'
  | 'users'
  | 'audit'
  | 'security';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: NavigationTab;
  labelKey: string;
  defaultLabel: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreadCount,
  isOpen,
  onClose,
}) => {
  const { user, role, logout, quickSwitchRole } = useAuth();
  const { t, isRTL } = useLanguage();
  const { effectiveTheme } = useTheme();

  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'] },
    { id: 'production', labelKey: 'nav.production', defaultLabel: 'Production', icon: Factory, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'] },
    { id: 'lines', labelKey: 'nav.lines', defaultLabel: 'Production Lines', icon: Layers, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'] },
    { id: 'machines', labelKey: 'nav.machines', defaultLabel: 'Machine Monitoring', icon: Cpu, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'] },
    { id: 'faults', labelKey: 'nav.faults', defaultLabel: 'Fault Management', icon: AlertOctagon, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'] },
    { id: 'downtime', labelKey: 'nav.downtime', defaultLabel: 'Downtime Analysis', icon: Timer, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'maintenance', labelKey: 'nav.maintenance', defaultLabel: 'Maintenance', icon: Wrench, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'inventory', labelKey: 'nav.inventory', defaultLabel: 'Inventory & Stock', icon: Boxes, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'products', labelKey: 'nav.products', defaultLabel: 'Products', icon: Package, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'employees', labelKey: 'nav.employees', defaultLabel: 'Employees', icon: Users, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'reports', labelKey: 'nav.reports', defaultLabel: 'Reports & Analytics', icon: FileBarChart, roles: ['Admin', 'Manager', 'Supervisor'] },
    { id: 'notifications', labelKey: 'nav.notifications', defaultLabel: 'Notifications', icon: Bell, roles: ['Admin', 'Manager', 'Supervisor', 'Employee'], badge: unreadCount },
    { id: 'users', labelKey: 'nav.users', defaultLabel: 'Users & Roles', icon: ShieldCheck, roles: ['Admin'] },
    { id: 'audit', labelKey: 'nav.audit', defaultLabel: 'Audit Logs', icon: ClipboardList, roles: ['Admin'] },
    { id: 'security', labelKey: 'nav.security', defaultLabel: 'Security & OWASP', icon: ShieldAlert, roles: ['Admin'] },
  ];

  const allowedNavItems = navItems.filter(item => role && item.roles.includes(role));

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Manager: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Supervisor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Employee: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };

  const transformClass = isRTL
    ? (isOpen ? 'translate-x-0' : 'translate-x-full')
    : (isOpen ? 'translate-x-0' : '-translate-x-full');

  const anchorClass = isRTL
    ? 'right-0 border-l border-slate-200 dark:border-slate-800'
    : 'left-0 border-r border-slate-200 dark:border-slate-800';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 z-40 w-64 bg-white/95 dark:bg-[#0C121E]/95 backdrop-blur-md flex flex-col transition-transform duration-200 lg:translate-x-0 ${anchorClass} ${transformClass} shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0F172A]/50">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" withGlow={true} />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-wide flex items-center gap-1.5">
                <span>SMART FACTORY</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono font-bold border border-teal-200/60 dark:border-teal-800/60">
                  OS
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('bentoSub')}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Rapid Persona Demonstration */}
        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
            <span>{t('demoPersonaSwitcher')}</span>
            <UserCheck className="w-3 h-3 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {(['Admin', 'Manager', 'Supervisor', 'Employee'] as UserRole[]).map(r => (
              <button
                key={r}
                id={`role-switch-${r.toLowerCase()}`}
                onClick={() => quickSwitchRole(r)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  role === r
                    ? 'bg-slate-900 dark:bg-teal-600 text-white font-bold shadow-xs shadow-slate-900/10 dark:shadow-teal-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60'
                }`}
                title={`${t('switchSessionTo')} ${r}`}
              >
                <span className="truncate">{t(r, r)}</span>
                {role === r && <Check className="w-3 h-3 text-teal-400 dark:text-white shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            {t('operationalModules')}
          </div>

          {allowedNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const itemTitle = t(item.labelKey, item.defaultLabel);
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{itemTitle}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-teal-700' : 'bg-rose-500 text-white'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    isRTL ? <ChevronLeft className="w-3.5 h-3.5 opacity-90" /> : <ChevronRight className="w-3.5 h-3.5 opacity-90" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Controls (Language & Theme) for quick access */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between gap-2">
          <div className="flex-1">
            <CountryLanguageSelector variant="compact" />
          </div>
          <ThemeToggle variant="simple" />
        </div>

        {/* Current User Session Footer */}
        {user && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0B111E]/70">
            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/70 rounded-xl shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {user.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{t(user.name, user.name)}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border font-semibold ${roleColors[user.role]}`}>
                      {t(user.role, user.role)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                id="btn-sidebar-logout"
                onClick={logout}
                title={t('logout')}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
