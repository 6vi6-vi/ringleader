import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import client from '../api/client';
import closeIcon from '../images/close.png';
import eyeOpenIcon from '../images/eye-open.png';
import eyeClosedIcon from '../images/eye-closed.png';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [passport, setPassport] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login: authLogin } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
        setError('ФИО должно содержать не менее 2 символов');
        return;
    }

    if (passport.trim().length < 5) {
        setError('Паспортные данные должны содержать не менее 5 символов');
        return;
    }

    if (login.trim().length < 3) {
        setError('Логин должен содержать не менее 3 символов');
        return;
    }

    if (password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }

   
    try {
      const response = await client.post('/auth/register', {
        full_name: fullName.trim(),
        passport: passport.trim(),
        login: login.trim(),
        password,
      });
      
      const { access_token, role, full_name } = response.data;
      authLogin(access_token, role, full_name);
      onClose();
      navigate('/');
    } 
    catch (err) {
        if (err.response?.status === 409) {
            setError('Пользователь с таким логином уже существует');
        } else if (err.response?.status === 422) {
            // Ошибка валидации Pydantic
            const detail = err.response.data?.detail;
            if (Array.isArray(detail)) {
                // FastAPI возвращает массив ошибок валидации
                const messages = detail.map((d) => d.msg).join('; ');
                setError(messages);
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Ошибка валидации данных');
            }
        } else if (err.response?.data?.detail) {
            setError(err.response.data.detail);
        } else if (err.request) {
            setError('Сервер недоступен. Проверьте подключение.');
        } else {
            setError('Произошла ошибка при регистрации');
        }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="register-modal-overlay" onClick={handleOverlayClick}>
      <div className="register-modal">
        <div className="register-modal-header">
          <h2 className="register-modal-title">Регистрация</h2>
          <button className="register-modal-close" onClick={onClose}>
            <img src={closeIcon} alt="Закрыть" />
          </button>
        </div>

        <form className="register-modal-form" onSubmit={handleSubmit}>
          <div className="register-modal-field">
            <label className="register-modal-label" htmlFor="regFullName">ФИО</label>
            <input
              id="regFullName"
              className="register-modal-input"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="register-modal-field">
            <label className="register-modal-label" htmlFor="regPassport">Паспортные данные</label>
            <input
              id="regPassport"
              className="register-modal-input"
              type="text"
              placeholder="Серия и номер"
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              required
            />
          </div>

          <div className="register-modal-field">
            <label className="register-modal-label" htmlFor="regLogin">Логин</label>
            <input
              id="regLogin"
              className="register-modal-input"
              type="text"
              placeholder="Придумайте логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="register-modal-field">
            <label className="register-modal-label" htmlFor="regPassword">Пароль</label>
            <div className="register-modal-password-wrapper">
              <input
                id="regPassword"
                className="register-modal-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Придумайте пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="register-modal-eye"
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

          {error && <p className="register-modal-error">{error}</p>}

          <button type="submit" className="register-modal-submit">
            Зарегистрироваться
          </button>
        </form>

        <p className="register-modal-footer">
          <span className="register-modal-footer-text">Уже есть аккаунт? </span>
          <button
            className="register-modal-switch"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;