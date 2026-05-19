import logo from '../images/logo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-background" />

      <div className="footer-content">
        <div className="footer-brand">
          <img className="footer-logo" src={logo} alt="Ringleader" />
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