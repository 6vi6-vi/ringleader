import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../images/logo.png';
import avatarPlaceholder from '../images/avatar.png';
import bellIcon from '../images/bell.png';
import './Header.css';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import UserMenu from './UserMenu';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { isAuthenticated, fullName, avatarUrl, logout } = useAuthStore();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.location.reload();
    }
  };

  const isActive = (path) => location.pathname === path;

  const getNameParts = (fullName) => {
    if (!fullName) return { surname: '', name: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { surname: parts[0], name: parts[1] };
    }
    return { surname: fullName, name: '' };
  };

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <>
      <div className="header-wrapper">
        <header className="header">
          <div className="header-background" />

          <Link
            to="/"
            className="header-logo"
            onClick={handleLogoClick}
          >
            <img src={logo} alt="Ringleader" className="header-logo-image" />
          </Link>

          <nav className="header-nav">
            <Link
              to="/exhibitions"
              className={`header-nav-item ${isActive('/exhibitions') ? 'header-nav-item--active' : ''}`}
            >
              ВЫСТАВКИ
            </Link>
            <Link
              to="/clubs"
              className={`header-nav-item ${isActive('/clubs') ? 'header-nav-item--active' : ''}`}
            >
              КЛУБЫ
            </Link>
            <Link
              to="/dogs"
              className={`header-nav-item ${isActive('/dogs') ? 'header-nav-item--active' : ''}`}
            >
              СОБАКИ
            </Link>
            <Link
              to="/experts"
              className={`header-nav-item ${isActive('/experts') ? 'header-nav-item--active' : ''}`}
            >
              ЭКСПЕРТЫ
            </Link>
          </nav>

          <div className="header-auth">
            {isAuthenticated ? (
              <div className="header-auth-user" ref={userMenuRef}>
                <button
                  className="header-auth-user-trigger"
                  onClick={handleUserMenuToggle}
                  type="button"
                >
                  <div className="header-auth-name">
                    <span className="header-auth-name-line">
                      {getNameParts(fullName).surname}
                    </span>
                    <span className="header-auth-name-line">
                      {getNameParts(fullName).name}
                    </span>
                  </div>
                  <img
                    className="header-auth-avatar"
                    src={avatarUrl || avatarPlaceholder}
                    alt="Аватар"
                  />
                </button>
                <button
                  className="header-auth-notifications"
                  type="button"
                >
                  <img src={bellIcon} alt="Уведомления" />
                </button>
                <UserMenu
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                  onLogout={logout}
                />
              </div>
            ) : (
              <button
                className="header-auth-login"
                onClick={() => setIsLoginOpen(true)}
                type="button"
              >
                Войти
              </button>
            )}
          </div>
        </header>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
};

export default Header;