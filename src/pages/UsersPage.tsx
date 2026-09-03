import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, UserRole } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Search,
  Plus,
  Key,
  Lock,
  UserCheck,
  X,
  CheckCircle2,
  ShieldAlert,
  LayoutGrid,
  List,
  Eye,
  Mail,
  Building2,
  Clock,
  Shield,
  Check
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Forms
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Employee' as UserRole,
    department: 'Production Operations',
    password: ''
  });

  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users', { search, role: roleFilter });
      if (res.success) setUsers(res.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUserForm);
      if (res.success) {
        toastSuccess(t('User Account Created', 'User Account Created'), `User ${res.user.name} registered.`);
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err: any) {
      toastError(t('Creation Failed', 'Creation Failed'), err.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.patch(`/users/${user.id}`, { status: nextStatus });
      if (res.success) {
        toastSuccess(t('Status Updated', 'Status Updated'), `${user.name} is now ${nextStatus}`);
        fetchUsers();
      }
    } catch (err: any) {
      toastError(t('Update Failed', 'Update Failed'), err.message);
    }
  };

  const handleUpdateRole = async (user: User, newRole: UserRole) => {
    try {
      const res = await api.patch(`/users/${user.id}`, { role: newRole });
      if (res.success) {
        toastSuccess(t('Role Modified', 'Role Modified'), `${user.name} granted ${newRole} role.`);
        fetchUsers();
      }
    } catch (err: any) {
      toastError(t('Role Change Failed', 'Role Change Failed'), err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await api.patch(`/users/${selectedUser.id}/password`, {
        password: newPassword
      });
      if (res.success) {
        toastSuccess(t('Password Reset', 'Password Reset'), `Password for ${selectedUser.name} updated.`);
        setShowPasswordModal(false);
        setNewPassword('');
      }
    } catch (err: any) {
      toastError(t('Reset Failed', 'Reset Failed'), err.message);
    }
  };

  const roleColors: Record<UserRole, { badge: string; avatar: string }> = {
    Admin: {
      badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      avatar: 'from-rose-500 to-pink-600'
    },
    Manager: {
      badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
      avatar: 'from-purple-500 to-indigo-600'
    },
    Supervisor: {
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      avatar: 'from-amber-500 to-orange-600'
    },
    Employee: {
      badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60',
      avatar: 'from-teal-500 to-emerald-600'
    }
  };

  // Metrics
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const operatorCount = users.filter(u => u.role === 'Employee').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>{t('User Management')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Administer system logins, granular permissions, session lifecycles, and cryptographic credentials.')}
          </p>
        </div>

        <button
          id="btn-create-user-account"
          onClick={() => {
            setNewUserForm({
              name: '',
              email: '',
              role: 'Employee',
              department: 'Production Operations',
              password: 'InitialPass2026!'
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs transition-all shadow-sm shadow-teal-600/20 hover:shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Provision User Account')}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('All Accounts', 'Total Accounts')}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalUsers}</div>
          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">{t('systemAccounts', 'System accounts in directory')}</div>
        </div>

        <div className="p-4 bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('Active Personnel', 'Active Personnel')}</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{Math.round((activeCount / (totalUsers || 1)) * 100)}% {t('operationalRate', 'Active operational rate')}</div>
        </div>

        <div className="p-4 bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('Operators', 'Operators')}</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{operatorCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{t('shopFloorCrew', 'Shop floor production staff')}</div>
        </div>

        <div className="p-4 bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('Admin Privilege', 'Administrators')}</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{adminCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{t('fullControlRoot', 'Full root security control')}</div>
        </div>
      </div>

      {/* Filter and View Switcher */}
      <div className="bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by User Name, Email, or Department...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="">{t('All Security Roles')}</option>
            <option value="Admin">{t('Admin (Full Control)')}</option>
            <option value="Manager">{t('Manager')}</option>
            <option value="Supervisor">{t('Supervisor')}</option>
            <option value="Employee">{t('Employee (Operator)')}</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              title={t('Card View', 'Card View')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title={t('Table View', 'Table View')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-750 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Matrix Quick Reference Bento Card */}
      <div className="bg-white/90 dark:bg-[#0E1626]/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{t('Role Security Matrix & Permissions')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>{t('admin')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 font-mono">100%</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t('Full system control, user provisioning, security audits, machine registration, and database administration.')}
            </div>
          </div>
          <div className="p-3.5 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <div className="font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between">
              <span>{t('manager')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 font-mono">80%</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t('Production order initialization, inventory cataloging, scheduling maintenance, and compliance reporting.')}
            </div>
          </div>
          <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>{t('supervisor')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 font-mono">60%</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t('Line execution oversight, work order dispatching, fault incident logging & resolution, and machine telemetry controls.')}
            </div>
          </div>
          <div className="p-3.5 bg-teal-50/40 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/30">
            <div className="font-bold text-teal-700 dark:text-teal-400 flex items-center justify-between">
              <span>{t('operator')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 font-mono">30%</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t('View production dashboard, record output units & scrap counts, submit incident reports, and log stock movements.')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium text-xs bg-white/90 dark:bg-[#0E1626]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t('loading')}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium text-xs bg-white/90 dark:bg-[#0E1626]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {t('Zero team members found')}
        </div>
      ) : viewMode === 'cards' ? (
        /* Rich User Profile Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(u => {
            const style = roleColors[u.role] || roleColors.Employee;
            const isSelf = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className="bg-white/95 dark:bg-[#0E1626]/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${style.avatar} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 select-none`}>
                        {u.name ? u.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {t(u.name, u.name)}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono font-bold border border-teal-200/60 dark:border-teal-800/60 shrink-0">
                              {t('You', 'You')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={isSelf}
                      className="cursor-pointer disabled:cursor-not-allowed shrink-0"
                      title={isSelf ? t('cannotDeactivateSelf', 'Cannot alter own active session') : t('toggleStatus', 'Toggle Account Active Status')}
                    >
                      <StatusBadge status={u.status} />
                    </button>
                  </div>

                  {/* Metadata Pills */}
                  <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('Department')}</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {t(u.department, u.department)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('Security Role')}</span>
                      </span>
                      <select
                        value={u.role}
                        onChange={e => handleUpdateRole(u, e.target.value as UserRole)}
                        disabled={isSelf}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer disabled:cursor-not-allowed ${style.badge}`}
                      >
                        <option value="Admin">{t('Admin')}</option>
                        <option value="Manager">{t('Manager')}</option>
                        <option value="Supervisor">{t('Supervisor')}</option>
                        <option value="Employee">{t('Employee')}</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('Last Active Login')}</span>
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('Never')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 mt-2">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{t('viewDetails', 'Profile & Permissions')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setNewPassword('');
                      setShowPasswordModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                    title={t('Reset Password')}
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Data Table View */
        <div className="bg-white/95 dark:bg-[#0E1626]/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">{t('User Identity')}</th>
                  <th className="px-5 py-3.5">{t('Department')}</th>
                  <th className="px-5 py-3.5">{t('Security Role')}</th>
                  <th className="px-5 py-3.5">{t('Last Active Login')}</th>
                  <th className="px-5 py-3.5">{t('status')}</th>
                  <th className="px-5 py-3.5 text-right rtl:text-left">{t('Security Controls')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {users.map(u => {
                  const style = roleColors[u.role] || roleColors.Employee;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${style.avatar} text-white font-bold text-xs flex items-center justify-center font-sans shadow-xs shrink-0 select-none`}>
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-sans font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{t(u.name, u.name)}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono font-bold border border-teal-200/60 dark:border-teal-800/60">
                                  {t('You', 'You')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap font-medium">
                        {t(u.department, u.department)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-sans">
                        <select
                          value={u.role}
                          onChange={e => handleUpdateRole(u, e.target.value as UserRole)}
                          disabled={isSelf}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer disabled:cursor-not-allowed ${style.badge}`}
                        >
                          <option value="Admin">{t('Admin')}</option>
                          <option value="Manager">{t('Manager')}</option>
                          <option value="Supervisor">{t('Supervisor')}</option>
                          <option value="Employee">{t('Employee')}</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('Never')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          className="cursor-pointer disabled:cursor-not-allowed"
                        >
                          <StatusBadge status={u.status} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                        <div className="flex items-center justify-end rtl:justify-start gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowDetailsModal(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-sans font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            <span>{t('view', 'View')}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword('');
                              setShowPasswordModal(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 text-[11px] font-sans font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            <Key className="w-3 h-3 text-amber-500" />
                            <span>{t('Reset Password')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details & Permissions Drawer/Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${roleColors[selectedUser.role]?.avatar || 'from-teal-500 to-emerald-600'} text-white font-black text-lg flex items-center justify-center shadow-md select-none`}>
                {selectedUser.name ? selectedUser.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {t(selectedUser.name, selectedUser.name)}
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.email}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${roleColors[selectedUser.role]?.badge}`}>
                    {t(selectedUser.role, selectedUser.role)}
                  </span>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('Department')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t(selectedUser.department, selectedUser.department)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('Last Active Login')}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : t('Never')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('securityStandard', 'Security Standard')}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Bcrypt + PBKDF2</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t('Granted Module Permissions', 'Granted Module Permissions')}</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { name: t('nav.dashboard', 'Dashboard & Metrics'), allowed: true },
                    { name: t('nav.production', 'Production Tracking'), allowed: true },
                    { name: t('nav.machines', 'Machine Telemetry'), allowed: true },
                    { name: t('nav.faults', 'Fault Incident Logging'), allowed: true },
                    { name: t('nav.downtime', 'Downtime Analysis'), allowed: selectedUser.role !== 'Employee' },
                    { name: t('nav.maintenance', 'Maintenance Scheduling'), allowed: selectedUser.role !== 'Employee' },
                    { name: t('nav.inventory', 'Inventory & Stock'), allowed: selectedUser.role !== 'Employee' },
                    { name: t('nav.users', 'User Administration'), allowed: selectedUser.role === 'Admin' },
                    { name: t('nav.audit', 'Security Audit Logs'), allowed: selectedUser.role === 'Admin' }
                  ].map((perm, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl flex items-center gap-2 border ${
                        perm.allowed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                      }`}
                    >
                      {perm.allowed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate font-medium">{perm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{t('Provision User Account')}</span>
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('email')}</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Security Role')}</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Admin">{t('Admin (Full System Privilege)')}</option>
                    <option value="Manager">{t('Manager')}</option>
                    <option value="Supervisor">{t('Supervisor')}</option>
                    <option value="Employee">{t('Employee (Line Operator)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Department')}</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.department}
                    onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Initial Password (Bcrypt Encrypted)')}</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t('Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1 tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <span>{t('Reset Password')}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-mono mb-4 text-xs">{selectedUser.name} ({selectedUser.email})</p>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('New Security Password')}</label>
                <input
                  type="password"
                  required
                  placeholder={t('Minimum 8 chars, 1 number, 1 special symbol...')}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t('Update Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
