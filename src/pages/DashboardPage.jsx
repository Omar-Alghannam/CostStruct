/**
 * Dashboard Page (Home)
 * Overview of all projects with key metrics, budget alerts,
 * and quick-access charts.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToProjects } from '../services/projectService';
import { subscribeToExpenses, EXPENSE_CATEGORIES } from '../services/expenseService';
import StatsCard from '../components/StatsCard';
import { FiFolder, FiDollarSign, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';

  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const unsub1 = subscribeToProjects(
      user.uid,
      (data) => {
        setProjects(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    const unsub2 = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data);
      },
      (err) => {
        console.error('Expenses subscription error:', err);
      }
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  // Calculate total budget & spent
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = totalBudget - totalSpent;

  // Budget alerts: projects exceeding 85%
  const budgetAlerts = projects.filter((p) => {
    const projectExpenses = expenses
      .filter((e) => e.projectId === p.id)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    return p.budget > 0 && (projectExpenses / p.budget) * 100 > 85;
  });

  // Show alerts
  useEffect(() => {
    budgetAlerts.forEach((p) => {
      const spent = expenses
        .filter((e) => e.projectId === p.id)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const percent = Math.round((spent / p.budget) * 100);
      if (percent >= 100) {
        toast.error(`${t('alerts.budgetExceeded')}: ${isAr ? p.name_ar || p.name_en : p.name_en}`);
      }
    });
  }, [budgetAlerts.length]);

  // Category breakdown
  const categoryBreakdown = Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => {
    const total = expenses
      .filter((e) => e.category_en === key)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    return { key, label: isAr ? val.ar : val.en, total };
  }).filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Recent expenses
  const recentExpenses = expenses.slice(0, 5);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="alert-box alert-box--danger" style={{ marginTop: '2rem' }}>
          <FiAlertTriangle size={24} />
          <div>
            <h3>{t('common.error')}</h3>
            <p>{error.message}</p>
            {error.code === 'failed-precondition' && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                <strong>Tip:</strong> This usually means a Firestore index is missing. Check the browser console for a link to create it.
              </p>
            )}
            <button 
              className="btn btn--primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('nav.dashboard')}</h1>
        <p className="page-subtitle">{t('app.subtitle')}</p>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <StatsCard
          icon={<FiFolder size={24} />}
          label={t('projects.totalProjects')}
          value={projects.length}
          color="primary"
        />
        <StatsCard
          icon={<FiDollarSign size={24} />}
          label={t('projects.totalBudget')}
          value={`${totalBudget.toLocaleString()} ${t('common.currency')}`}
          color="success"
        />
        <StatsCard
          icon={<FiTrendingUp size={24} />}
          label={t('projects.totalSpent')}
          value={`${totalSpent.toLocaleString()} ${t('common.currency')}`}
          color="warning"
        />
        <StatsCard
          icon={<FiAlertTriangle size={24} />}
          label={t('projects.remaining')}
          value={`${remaining.toLocaleString()} ${t('common.currency')}`}
          color={remaining < 0 ? 'danger' : 'info'}
        />
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="alert-box alert-box--warning">
          <FiAlertTriangle size={20} />
          <div>
            <strong>{t('alerts.budgetExceeded')}</strong>
            <ul>
              {budgetAlerts.map((p) => {
                const spent = expenses
                  .filter((e) => e.projectId === p.id)
                  .reduce((sum, e) => sum + (e.amount || 0), 0);
                return (
                  <li key={p.id}>
                    {isAr ? p.name_ar || p.name_en : p.name_en} —{' '}
                    {Math.round((spent / p.budget) * 100)}%
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="card__title">{t('reports.expensesByCategory')}</h3>
          <div className="category-list">
            {categoryBreakdown.length === 0 ? (
              <p className="text-muted">{t('common.noData')}</p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.key} className="category-item">
                  <div className="category-item__header">
                    <span className="category-item__label">{cat.label}</span>
                    <span className="category-item__amount">
                      {cat.total.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{
                        width: `${totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projects Overview */}
        <div className="card">
          <h3 className="card__title">{t('nav.projects')}</h3>
          <div className="project-list">
            {projects.length === 0 ? (
              <p className="text-muted">{t('projects.noProjects')}</p>
            ) : (
              projects.slice(0, 5).map((p) => {
                const projectSpent = expenses
                  .filter((e) => e.projectId === p.id)
                  .reduce((sum, e) => sum + (e.amount || 0), 0);
                const percent = p.budget > 0 ? (projectSpent / p.budget) * 100 : 0;
                return (
                  <div key={p.id} className="project-item">
                    <div className="project-item__header">
                      <span className="project-item__name">
                        {isAr ? p.name_ar || p.name_en : p.name_en}
                      </span>
                      <span
                        className={`badge badge--${
                          p.status === 'active'
                            ? 'success'
                            : p.status === 'completed'
                            ? 'info'
                            : 'warning'
                        }`}
                      >
                        {t(`projects.${p.status}`)}
                      </span>
                    </div>
                    <div className="project-item__budget">
                      <span>
                        {projectSpent.toLocaleString()} / {(p.budget || 0).toLocaleString()}{' '}
                        {t('common.currency')}
                      </span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar__fill ${
                          percent > 100 ? 'progress-bar__fill--danger' : ''
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card card--full">
          <h3 className="card__title">{t('expenses.title')}</h3>
          <div className="recent-expenses">
            {recentExpenses.length === 0 ? (
              <p className="text-muted">{t('expenses.noExpenses')}</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('expenses.description')}</th>
                    <th>{t('expenses.category')}</th>
                    <th>{t('expenses.amount')}</th>
                    <th>{t('expenses.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((e) => (
                    <tr key={e.id}>
                      <td>{isAr ? e.description_ar || e.description_en : e.description_en}</td>
                      <td>{isAr ? e.category_ar || e.category_en : e.category_en}</td>
                      <td>{(e.amount || 0).toLocaleString()} {t('common.currency')}</td>
                      <td>{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
