import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import client from '../api/client';
import closeIcon from '../images/close.png';
import eyeOpenIcon from '../images/eye-open.png';
import eyeClosedIcon from '../images/eye-closed.png';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login: authLogin } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await client.post('/auth/login', { login, password });
      const { access_token, role, full_name } = response.data;
      authLogin(access_token, role, full_name);
      onClose();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <div className="login-modal-header">
          <h2 className="login-modal-title">Вход</h2>
          <button className="login-modal-close" onClick={onClose}>
            <img src={closeIcon} alt="Закрыть" />
          </button>
        </div>

        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="login-modal-field">
            <label className="login-modal-label" htmlFor="login">Логин</label>
            <input
              id="login"
              className="login-modal-input"
              type="text"
              placeholder="Введите логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="login-modal-field">
            <label className="login-modal-label" htmlFor="password">Пароль</label>
            <div className="login-modal-password-wrapper">
              <input
                id="password"
                className="login-modal-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-modal-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                    <img src={eyeClosedIcon} alt="Скрыть пароль" />
                ) : (
                    <img src={eyeOpenIcon} alt="Показать пароль" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="login-modal-error">{error}</p>}

          <button type="submit" className="login-modal-submit">
            Войти
          </button>
        </form>

        <p className="login-modal-footer">
          <span className="login-modal-footer-text">Нет аккаунта? </span>
          <button
            className="login-modal-switch"
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;