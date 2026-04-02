/**
 * Projects Page
 * Full project management with CRUD, budget tracking, and status badges.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService';
import { subscribeToExpenses } from '../services/expenseService';
import ProjectModal from '../components/ProjectModal';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { FiFolder, FiDollarSign, FiPlus, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';

  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      setLoading(false);
    }, (err) => {
      console.error('ProjectsPage projects error:', err);
      setLoading(false);
    });
    const unsub2 = subscribeToExpenses(user.uid, setExpenses, (err) => {
      console.error('ProjectsPage expenses error:', err);
    });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const getProjectSpent = (projectId) =>
    expenses.filter((e) => e.projectId === projectId).reduce((s, e) => s + (e.amount || 0), 0);

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const handleSubmit = async (formData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        toast.success(t('alerts.projectUpdated'));
      } else {
        await createProject(user.uid, formData);
        toast.success(t('alerts.projectAdded'));
      }
      setModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(t('projects.confirmDelete'))) return;
    try {
      await deleteProject(project.id);
      toast.success(t('alerts.projectDeleted'));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name_en', key_ar: 'name_ar', label: t('projects.projectName'), type: 'bilingual' },
    { key: 'budget', label: t('projects.budget'), type: 'currency' },
    {
      key: 'spent',
      label: t('projects.spent'),
      type: 'currency',
      render: (item) => `${getProjectSpent(item.id).toLocaleString()} ${t('common.currency')}`,
    },
    {
      key: 'remaining',
      label: t('projects.remaining'),
      render: (item) => {
        const rem = (item.budget || 0) - getProjectSpent(item.id);
        return (
          <span className={rem < 0 ? 'text-danger' : 'text-success'}>
            {rem.toLocaleString()} {t('common.currency')}
          </span>
        );
      },
    },
    {
      key: 'budgetUsed',
      label: t('projects.budgetUsed'),
      render: (item) => {
        const percent = item.budget > 0
          ? Math.round((getProjectSpent(item.id) / item.budget) * 100)
          : 0;
        return (
          <div className="progress-bar progress-bar--inline">
            <div
              className={`progress-bar__fill ${percent > 100 ? 'progress-bar__fill--danger' : ''}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
            <span className="progress-bar__label">{percent}%</span>
          </div>
        );
      },
    },
    { key: 'startDate', label: t('projects.startDate') },
    {
      key: 'status',
      label: t('projects.status'),
      render: (item) => (
        <span className={`badge badge--${item.status === 'active' ? 'success' : item.status === 'completed' ? 'info' : 'warning'}`}>
          {t(`projects.${item.status}`)}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{t('projects.title')}</h1>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditingProject(null); setModalOpen(true); }}>
          <FiPlus /> {t('projects.addProject')}
        </button>
      </div>

      <div className="stats-grid stats-grid--3">
        <StatsCard icon={<FiFolder size={24} />} label={t('projects.totalProjects')} value={projects.length} color="primary" />
        <StatsCard icon={<FiDollarSign size={24} />} label={t('projects.totalBudget')} value={`${totalBudget.toLocaleString()} ${t('common.currency')}`} color="success" />
        <StatsCard icon={<FiTrendingUp size={24} />} label={t('projects.totalSpent')} value={`${totalSpent.toLocaleString()} ${t('common.currency')}`} color="warning" />
      </div>

      <DataTable
        data={projects}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProject(null); }}
        onSubmit={handleSubmit}
        project={editingProject}
      />
    </div>
  );
}
