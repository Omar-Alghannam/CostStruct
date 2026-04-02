/**
 * ExpenseModal Component
 * Reusable modal for adding/editing expenses across all category dashboards.
 * Supports bilingual category labels.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EXPENSE_CATEGORIES } from '../services/expenseService';
import { FiX } from 'react-icons/fi';

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  expense = null,
  projects = [],
  defaultCategory = '',
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    projectId: '',
    category_en: defaultCategory || '',
    category_ar: '',
    description_en: '',
    description_ar: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (expense) {
      setFormData({
        projectId: expense.projectId || '',
        category_en: expense.category_en || defaultCategory,
        category_ar: expense.category_ar || '',
        description_en: expense.description_en || '',
        description_ar: expense.description_ar || '',
        amount: expense.amount || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        paidTo: expense.paidTo || '',
        isRecurring: expense.isRecurring || false,
        recurringFrequency: expense.recurringFrequency || 'monthly',
      });
    } else {
      setFormData({
        projectId: '',
        category_en: defaultCategory || '',
        category_ar: defaultCategory
          ? EXPENSE_CATEGORIES[defaultCategory]?.ar || ''
          : '',
        description_en: '',
        description_ar: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidTo: '',
        isRecurring: false,
        recurringFrequency: 'monthly',
      });
    }
  }, [expense, isOpen, defaultCategory]);

  // Auto-fill Arabic category when English category changes
  const handleCategoryChange = (e) => {
    const catKey = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category_en: catKey,
      category_ar: EXPENSE_CATEGORIES[catKey]?.ar || '',
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      category_en: formData.category_en,
      category_ar:
        formData.category_ar ||
        EXPENSE_CATEGORIES[formData.category_en]?.ar ||
        formData.category_en,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>
            {expense ? t('expenses.editExpense') : t('expenses.addExpense')}
          </h2>
          <button className="modal__close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div className="form-group">
            <label>{t('expenses.project')}</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
            >
              <option value="">{t('expenses.allProjects')}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.name_ar || p.name_en : p.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>{t('expenses.category')}</label>
            <select
              name="category_en"
              value={formData.category_en}
              onChange={handleCategoryChange}
              disabled={!!defaultCategory}
              className={defaultCategory ? 'bg-disabled' : ''}
              required
            >
              <option value="">{t('expenses.allCategories')}</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {isAr ? val.ar : val.en}
                </option>
              ))}
            </select>
            {defaultCategory && (
              <p className="form-help text-muted">
                {isAr ? 'يتم قفل الفئة في هذا القسم' : 'Category is locked in this section'}
              </p>
            )}
          </div>

          {/* Description EN */}
          <div className="form-row">
            <div className="form-group">
              <label>{t('expenses.description')} (EN)</label>
              <input
                type="text"
                name="description_en"
                value={formData.description_en}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('expenses.description')} (AR)</label>
              <input
                type="text"
                name="description_ar"
                value={formData.description_ar}
                onChange={handleChange}
                dir="rtl"
              />
            </div>
          </div>

          {/* Amount & Date */}
          <div className="form-row">
            <div className="form-group">
              <label>{t('expenses.amount')} ({t('common.currency')})</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('expenses.date')}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Paid To */}
          <div className="form-group">
            <label>{t('expenses.paidTo')}</label>
            <input
              type="text"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleChange}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="form-group form-group--inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
              <span>{t('recurring.isRecurring')}</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-group">
              <label>{t('recurring.frequency')}</label>
              <select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={handleChange}
              >
                <option value="daily">{t('recurring.daily')}</option>
                <option value="weekly">{t('recurring.weekly')}</option>
                <option value="monthly">{t('recurring.monthly')}</option>
                <option value="yearly">{t('recurring.yearly')}</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn--primary">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
