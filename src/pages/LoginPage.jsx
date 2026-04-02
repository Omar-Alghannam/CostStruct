/**
 * Login/Signup Page
 * Handles email/password auth and Google OAuth.
 * Toggles between login and signup modes.
 * Professional design with red/white theme.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-page__bg">
        <div className="login-page__bg-shape login-page__bg-shape--1" />
        <div className="login-page__bg-shape login-page__bg-shape--2" />
        <div className="login-page__bg-shape login-page__bg-shape--3" />
      </div>

      <div className="login-card">
        {/* Language Toggle */}
        <button className="login-card__lang" onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'العربية' : 'English'}
        </button>

        {/* Header */}
        <div className="login-card__header">
          <span className="login-card__logo">🏗️</span>
          <h1>{isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}</h1>
          <p>{isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}</p>
        </div>

        {/* Google Login */}
        <button
          className="btn btn--google"
          onClick={handleGoogle}
          disabled={loading}
        >
          <FcGoogle size={22} />
          <span>{t('auth.googleLogin')}</span>
        </button>

        {/* Divider */}
        <div className="login-card__divider">
          <span>{t('auth.orDivider')}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group form-group--icon">
            <FiMail className="form-icon" />
            <input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group form-group--icon">
            <FiLock className="form-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="form-icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {!isLogin && (
            <div className="form-group form-group--icon">
              <FiLock className="form-icon" />
              <input
                type="password"
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner loading-spinner--small" />
            ) : (
              <>
                <FiLogIn />
                <span>{isLogin ? t('auth.login') : t('auth.signup')}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <p className="login-card__toggle">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
}
