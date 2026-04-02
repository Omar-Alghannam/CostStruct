/**
 * Category Expense Page (Reusable)
 * Used by Labor, Materials, Equipment, and Admin sections.
 * Each section shows its own filtered stats, table, and controls.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToProjects } from '../services/projectService';
import {
  subscribeToExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';
import ExpenseModal from '../components/ExpenseModal';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { exportToCSV, exportToPDF } from '../services/exportService';
import { FiPlus, FiDownload, FiDollarSign, FiTrendingUp, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CategoryExpensePage({
  categoryKeys = [],
  titleKey,
  subtitleKey,
  icon,
  accentColor = 'primary',
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';

  const [allExpenses, setAllExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filters
  const [filterProject, setFilterProject] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    if (!user) return;
    console.log('[CategoryExpensePage] Subscribing for user:', user.uid, 'categoryKeys:', categoryKeys);
    const unsub1 = subscribeToExpenses(user.uid, (data) => {
      console.log('[CategoryExpensePage] Received expenses:', data.length, 'items');
      if (data.length > 0) {
        console.log('[CategoryExpensePage] First expense:', JSON.stringify(data[0]));
        console.log('[CategoryExpensePage] All category_en values:', data.map(e => e.category_en));
      }
      setAllExpenses(data);
      setLoading(false);
    }, (err) => {
      console.error('[CategoryExpensePage] Expenses subscription ERROR:', err.code, err.message);
      setLoading(false);
    });
    const unsub2 = subscribeToProjects(user.uid, setProjects, (err) => {
      console.error('[CategoryExpensePage] Projects subscription ERROR:', err.code, err.message);
    });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  // Filter expenses by category keys
  const categoryExpenses = allExpenses.filter((e) =>
    categoryKeys.includes(e.category_en)
  );
  console.log('[CategoryExpensePage] Filtered by', categoryKeys, '→', categoryExpenses.length, 'results from', allExpenses.length, 'total');

  // Apply additional filters
  const filteredExpenses = categoryExpenses.filter((e) => {
    if (filterProject && e.projectId !== filterProject) return false;
    if (filterDateFrom && e.date < filterDateFrom) return false;
    if (filterDateTo && e.date > filterDateTo) return false;
    return true;
  });

  const totalAmount = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const avgAmount = filteredExpenses.length > 0
    ? totalAmount / filteredExpenses.length
    : 0;

  const handleSubmit = async (formData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData);
        toast.success(t('alerts.expenseUpdated'));
      } else {
        await createExpense(user.uid, formData);
        toast.success(t('alerts.expenseAdded'));
      }
      setModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm(t('expenses.confirmDelete'))) return;
    try {
      await deleteExpense(expense.id);
      toast.success(t('alerts.expenseDeleted'));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getProjectName = (projectId) => {
    const p = projects.find((proj) => proj.id === projectId);
    if (!p) return '-';
    return isAr ? p.name_ar || p.name_en : p.name_en;
  };

  const handleExportCSV = () => {
    const columns = [
      { header: t('expenses.description'), key: 'description_en' },
      { header: t('expenses.category'), key: 'category_en' },
      { header: t('expenses.amount'), key: 'amount' },
      { header: t('expenses.date'), key: 'date' },
      { header: t('expenses.paidTo'), key: 'paidTo' },
    ];
    exportToCSV(filteredExpenses, t(titleKey).replace(/\s/g, '_'), columns);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: t('expenses.description'), key: isAr ? 'description_ar' : 'description_en' },
      { header: t('expenses.category'), key: isAr ? 'category_ar' : 'category_en' },
      { header: t('expenses.amount'), key: 'amount' },
      { header: t('expenses.date'), key: 'date' },
      { header: t('expenses.paidTo'), key: 'paidTo' },
    ];
    exportToPDF(filteredExpenses, t(titleKey).replace(/\s/g, '_'), t(titleKey), columns);
  };

  const columns = [
    {
      key: 'description_en',
      key_ar: 'description_ar',
      label: t('expenses.description'),
      type: 'bilingual',
    },
    {
      key: 'category_en',
      key_ar: 'category_ar',
      label: t('expenses.category'),
      type: 'bilingual',
    },
    { key: 'amount', label: t('expenses.amount'), type: 'currency' },
    { key: 'date', label: t('expenses.date') },
    { key: 'paidTo', label: t('expenses.paidTo') },
    {
      key: 'projectId',
      label: t('expenses.project'),
      render: (item) => getProjectName(item.projectId),
    },
  ];

  const filtersUI = (
    <div className="filter-row">
      <select
        value={filterProject}
        onChange={(e) => setFilterProject(e.target.value)}
        className="filter-select"
      >
        <option value="">{t('expenses.allProjects')}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {isAr ? p.name_ar || p.name_en : p.name_en}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={filterDateFrom}
        onChange={(e) => setFilterDateFrom(e.target.value)}
        placeholder={t('expenses.from')}
        className="filter-date"
      />
      <input
        type="date"
        value={filterDateTo}
        onChange={(e) => setFilterDateTo(e.target.value)}
        placeholder={t('expenses.to')}
        className="filter-date"
      />
    </div>
  );

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t(titleKey)}</h1>
          <p className="page-subtitle">{t(subtitleKey)}</p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--secondary" onClick={handleExportCSV}>
            <FiDownload /> {t('reports.exportCSV')}
          </button>
          <button className="btn btn--secondary" onClick={handleExportPDF}>
            <FiDownload /> {t('reports.exportPDF')}
          </button>
          <button className="btn btn--primary" onClick={() => { setEditingExpense(null); setModalOpen(true); }}>
            <FiPlus /> {t('expenses.addExpense')}
          </button>
        </div>
      </div>

      <div className="stats-grid stats-grid--3">
        <StatsCard
          icon={<FiHash size={24} />}
          label={t('expenses.total') + ' ' + t('expenses.title')}
          value={filteredExpenses.length}
          color={accentColor}
        />
        <StatsCard
          icon={<FiDollarSign size={24} />}
          label={t('expenses.total')}
          value={`${totalAmount.toLocaleString()} ${t('common.currency')}`}
          color="success"
        />
        <StatsCard
          icon={<FiTrendingUp size={24} />}
          label={`${t('expenses.amount')} (avg)`}
          value={`${Math.round(avgAmount).toLocaleString()} ${t('common.currency')}`}
          color="warning"
        />
      </div>

      <DataTable
        data={filteredExpenses}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDeleteExpense}
        filters={filtersUI}
      />

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        onSubmit={handleSubmit}
        expense={editingExpense}
        projects={projects}
        defaultCategory={categoryKeys[0] || ''}
      />
    </div>
  );
}
