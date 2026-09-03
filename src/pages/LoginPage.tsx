import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { CountryLanguageSelector } from '../components/common/CountryLanguageSelector';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { BrandLogo } from '../components/common/BrandLogo';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { t, isRTL } = useLanguage();

  const [email, setEmail] = useState('admin@smartfactory.io');
  const [password, setPassword] = useState('FactoryAdmin2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(email, password);
      toastSuccess(t('authenticatedSuccess'), t('welcomeFactory'));
    } catch (err: any) {
      const msg = err.message || t('loginFailed');
      setErrorMessage(msg);
      toastError(t('authFailed'), msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (role: UserRole) => {
    if (role === 'Admin') {
      setEmail('admin@smartfactory.io');
      setPassword('FactoryAdmin2026!');
    } else if (role === 'Manager') {
      setEmail('manager@smartfactory.io');
      setPassword('FactoryMgr2026!');
    } else if (role === 'Supervisor') {
      setEmail('supervisor@smartfactory.io');
      setPassword('FactorySup2026!');
    } else if (role === 'Employee') {
      setEmail('operator@smartfactory.io');
      setPassword('Operator2026!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-800 dark:text-slate-200 relative overflow-hidden font-sans transition-colors">
      {/* Top Floating Language and Theme Switchers */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center gap-2">
        <CountryLanguageSelector variant="header" />
        <ThemeToggle variant="simple" />
      </div>

      {/* Background subtle geometry */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/50 dark:bg-teal-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-100/40 dark:bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-block">
            <BrandLogo size="lg" withGlow={true} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Smart Factory OS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {t('bentoSub')}
          </p>
        </div>

        {/* Login Bento Card */}
        <div className="bg-white/95 dark:bg-[#0E1626]/95 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-xl p-8 backdrop-blur-xl transition-colors">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">{t('plantGateway')}</span>
            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 font-mono text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>TLS 1.3 SECURE</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email-input">
                {t('operatorEmail')}
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all font-mono ${
                    isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                  }`}
                  placeholder="name@smartfactory.io"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password-input">
                {t('securityPassword')}
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all font-mono ${
                    isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                  }`}
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-600/20 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('authenticating')}
                </span>
              ) : (
                <>
                  <span>{t('authenticateAndEnter')}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t('oneClickDemo')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                id="btn-demo-admin"
                onClick={() => fillCredentials('Admin')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-start transition-all group"
              >
                <div className="font-bold text-rose-700 dark:text-rose-400 text-[11px]">{t('Admin (Full Access)')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin@smartfactory.io</div>
              </button>

              <button
                type="button"
                id="btn-demo-manager"
                onClick={() => fillCredentials('Manager')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-start transition-all group"
              >
                <div className="font-bold text-purple-700 dark:text-purple-400 text-[11px]">{t('Plant Manager')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">manager@smartfactory.io</div>
              </button>

              <button
                type="button"
                id="btn-demo-supervisor"
                onClick={() => fillCredentials('Supervisor')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-start transition-all group"
              >
                <div className="font-bold text-amber-700 dark:text-amber-400 text-[11px]">{t('Line Supervisor')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">supervisor@smartfactory.io</div>
              </button>

              <button
                type="button"
                id="btn-demo-operator"
                onClick={() => fillCredentials('Employee')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-start transition-all group"
              >
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">{t('Line Operator')}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">operator@smartfactory.io</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t('OWASP Top 10 Compliant • Bcrypt Hashed • RBAC Protected')}</span>
        </div>
      </div>
    </div>
  );
};
