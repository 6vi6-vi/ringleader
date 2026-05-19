import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import logo from '../images/logo.png';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.location.reload();
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
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

          <Link
            to="/results"
            className={`header-nav-item ${isActive('/results') ? 'header-nav-item--active' : ''}`}
          >
            РЕЗУЛЬТАТЫ
          </Link>
        </nav>

        <div className="header-auth">
          {isAuthenticated ? (
            <button className="header-auth-button" onClick={logout}>
              ВЫЙТИ
            </button>
          ) : (
            <Link to="/login" className="header-auth-link">
              Войти
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;