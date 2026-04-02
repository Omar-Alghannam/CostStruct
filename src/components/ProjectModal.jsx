/**
 * ProjectModal Component
 * Modal for adding/editing projects with bilingual names.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';

export default function ProjectModal({ isOpen, onClose, onSubmit, project = null }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name_en: project.name_en || '',
        name_ar: project.name_ar || '',
        budget: project.budget || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status || 'active',
      });
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
      });
    }
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budget: parseFloat(formData.budget),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>
            {project ? t('projects.editProject') : t('projects.addProject')}
          </h2>
          <button className="modal__close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('projects.projectName')} (EN)</label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('projects.projectName')} (AR)</label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                dir="rtl"
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('projects.budget')} ({t('common.currency')})</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('projects.startDate')}</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('projects.endDate')}</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('projects.status')}</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">{t('projects.active')}</option>
              <option value="completed">{t('projects.completed')}</option>
              <option value="onHold">{t('projects.onHold')}</option>
            </select>
          </div>

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
