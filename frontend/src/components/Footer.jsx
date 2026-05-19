import { Link, useLocation } from 'react-router-dom';
import logo from '../images/logo.png';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

    const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.location.reload();
    }
  };
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo-link"
            onClick={handleLogoClick}
          >
            <img className="footer-logo" src={logo} alt="Ringleader" />
          </Link>
          <p className="footer-copyright">
            &copy; 2026 RINGLEADER
            <br />
            Все права защищены
          </p>
        </div>

        <div className="footer-contacts">
          +7 (900) 123-45-67
          <br />
          ringleader@mail.ru
        </div>

        <div className="footer-links">
          Политика конфиденциальности
          <br />
          Реквизиты
        </div>
      </div>
    </footer>
  );
};

export default Footer;