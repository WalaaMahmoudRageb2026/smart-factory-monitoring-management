import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Employee, ProductionLine } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Clock,
  Layers,
  Award,
  X
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+1 (555) 019-2834',
    department: 'Production Operations',
    position: 'Senior Mechatronics Operator',
    shift: 'Shift 1 (06:00 - 14:00)' as any,
    assignedLineId: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [empRes, lineRes] = await Promise.all([
        api.get('/employees', { search, shift: shiftFilter, department: deptFilter }),
        api.get('/production-lines')
      ]);

      if (empRes.success) setEmployees(empRes.employees);
      if (lineRes.success) setLines(lineRes.lines);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, shiftFilter, deptFilter]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/employees', form);
      if (res.success) {
        toastSuccess(t('Employee Enrolled', 'Employee Enrolled'), `${res.employee.name} added to plant directory.`);
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError(t('Enrollment Failed', 'Enrollment Failed'), err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span>{t('Employees & Shifts')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Workforce directory, assigned production cells, shift allocations, and skill badges.')}
          </p>
        </div>

        {hasRole('Admin', 'Manager') && (
          <button
            id="btn-add-employee"
            onClick={() => {
              setForm({
                name: '',
                email: '',
                phone: '+1 (555) 019-2834',
                department: 'Production Operations',
                position: 'Senior Mechatronics Operator',
                shift: 'Shift 1 (06:00 - 14:00)',
                assignedLineId: lines[0]?.id || ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Enroll Team Member')}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by Employee Name, Position, or ID...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Shifts')}</option>
            <option value="Shift 1">{t('Shift 1 (06:00 - 14:00)')}</option>
            <option value="Shift 2">{t('Shift 2 (14:00 - 22:00)')}</option>
            <option value="Shift 3">{t('Shift 3 (22:00 - 06:00)')}</option>
          </select>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Departments')}</option>
            <option value="Production Operations">{t('Production Operations')}</option>
            <option value="Plant Engineering">{t('Plant Engineering')}</option>
            <option value="Quality Assurance">{t('Quality Assurance')}</option>
            <option value="Supply Chain Logistics">{t('Supply Chain Logistics')}</option>
            <option value="Plant Operations Management">{t('Plant Operations Management')}</option>
          </select>
        </div>
      </div>

      {/* Employees Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">{t('loading')}</div>
        ) : employees.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">{t('Zero team members found')}</div>
        ) : (
          employees.map(emp => (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50">
                    {emp.employeeId}
                  </span>
                  <StatusBadge status={emp.status} />
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-sm shadow-xs">
                    {emp.name ? emp.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EP'}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{emp.name}</h2>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(emp.position, emp.position)}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{t(emp.shift, emp.shift)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">{emp.assignedLineName || t('Unassigned Plant Cell')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>

                {/* Certifications Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {emp.certifications.map(cert => (
                    <span
                      key={cert}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium"
                    >
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>{t(cert, cert)}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{t('Hired')}: {emp.hireDate}</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t(emp.department, emp.department)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-xl p-6 relative text-xs">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>{t('Enroll Team Member')}</span>
            </h2>

            <form onSubmit={handleAddEmployee} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Full Name')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Sterling"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('email')}</label>
                  <input
                    type="email"
                    required
                    placeholder="j.sterling@smartfactory.io"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Department')}</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Production Operations">{t('Production Operations')}</option>
                    <option value="Plant Engineering">{t('Plant Engineering')}</option>
                    <option value="Quality Assurance">{t('Quality Assurance')}</option>
                    <option value="Supply Chain Logistics">{t('Supply Chain Logistics')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Position / Job Title')}</label>
                  <input
                    type="text"
                    required
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Assigned Shift')}</label>
                  <select
                    value={form.shift}
                    onChange={e => setForm({ ...form, shift: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Shift 1 (06:00 - 14:00)">{t('Shift 1 (06:00 - 14:00)')}</option>
                    <option value="Shift 2 (14:00 - 22:00)">{t('Shift 2 (14:00 - 22:00)')}</option>
                    <option value="Shift 3 (22:00 - 06:00)">{t('Shift 3 (22:00 - 06:00)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Assigned Line')}</label>
                  <select
                    value={form.assignedLineId}
                    onChange={e => setForm({ ...form, assignedLineId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {lines.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {t('Enroll Team Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

