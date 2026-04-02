/**
 * Sidebar Navigation Component
 * Collapsible sidebar with navigation links, language toggle, and theme toggle.
 * Supports both mobile and desktop layouts.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiPackage,
  FiTruck,
  FiFileText,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiGlobe,
} from 'react-icons/fi';

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { to: '/', icon: <FiHome />, label: t('nav.dashboard') },
    { to: '/projects', icon: <FiFolder />, label: t('nav.projects') },
    { to: '/labor', icon: <FiUsers />, label: t('nav.labor') },
    { to: '/materials', icon: <FiPackage />, label: t('nav.materials') },
    { to: '/equipment', icon: <FiTruck />, label: t('nav.equipment') },
    { to: '/admin-expenses', icon: <FiFileText />, label: t('nav.admin') },
    { to: '/reports', icon: <FiBarChart2 />, label: t('nav.reports') },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo / Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <span className="logo-icon">🏗️</span>
            <div className="logo-text">
              <h1>{t('app.title')}</h1>
              <p>{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Controls */}
        <div className="sidebar__footer">
          {/* User Email */}
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="sidebar__user-email">{user?.email || 'User'}</span>
          </div>

          {/* Controls Row */}
          <div className="sidebar__controls">
            {/* Language Toggle */}
            <button
              className="sidebar__control-btn"
              onClick={toggleLanguage}
              title={i18n.language === 'en' ? 'العربية' : 'English'}
            >
              <FiGlobe />
              <span>{i18n.language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              className="sidebar__control-btn"
              onClick={toggleTheme}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>

            {/* Logout */}
            <button className="sidebar__control-btn sidebar__control-btn--danger" onClick={handleLogout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
