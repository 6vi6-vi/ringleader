import { Link } from 'react-router-dom';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import pawIcon from '../images/paw.png';
import './HomePage.css';
import WinnersCarousel from '../components/WinnersCarousel';


const HomePage = () => {
  return (
    <div className="home-page">
      {/* ── Приветственный блок ── */}
      <section className="hero">
        <img
          className="hero-paws hero-paws--left"
          src={pawsPatternLeft}
          alt=""
        />
        <img
          className="hero-paws hero-paws--right"
          src={pawsPatternRight}
          alt=""
        />
        <h1 className="hero-title">Добро пожаловать на RINGLEADER!</h1>
      </section>

      {/* ── О нас ── */}
      <section className="about">
        <h2 className="about-title">О НАС</h2>
        <div className="about-content">
          <span className="about-brand">RINGLEADER</span> — это информационная система для организации и проведения выставок собак. Здесь вы можете найти информацию о породах, клубах и экспертах, зарегистрировать своих собак и подавать заявки на участие в выставках.
        </div>
      </section>

      {/* ── Ближайшие выставки ── */}
      <section className="upcoming-exhibitions">
        <h2 className="upcoming-exhibitions-title">БЛИЖАЙШИЕ ВЫСТАВКИ</h2>

        <ul className="upcoming-exhibitions-list">
          <li className="upcoming-exhibitions-item">
            <img
              className="upcoming-exhibitions-paw"
              src={pawIcon}
              alt=""
            />
            <span className="upcoming-exhibitions-text">
              17 мая — Королёв — Блок монопородных выставок
            </span>
          </li>
          <li className="upcoming-exhibitions-item">
            <img
              className="upcoming-exhibitions-paw"
              src={pawIcon}
              alt=""
            />
            <span className="upcoming-exhibitions-text">
              22 мая — Тамбов — Национальная выставка собак всех пород ранга CAC
            </span>
          </li>
          <li className="upcoming-exhibitions-item">
            <img
              className="upcoming-exhibitions-paw"
              src={pawIcon}
              alt=""
            />
            <span className="upcoming-exhibitions-text">
              31 мая — Новороссийск — Золотой кубок победителя Чёрного моря
            </span>
          </li>
        </ul>

        <Link to="/exhibitions" className="upcoming-exhibitions-button">
          Все выставки
        </Link>
      </section>

      {/* ── Победители последней выставки ── */}
      <section className="latest-results">
        <h2 className="latest-results-title">
          ПОБЕДИТЕЛИ ПОСЛЕДНЕЙ ВЫСТАВКИ
        </h2>

        <div className="latest-results-content">
          <p className="latest-results-exhibition">
            <span className="latest-results-exhibition-label">Выставка:</span>
            <span className="latest-results-exhibition-name">
              13 мая – Екатеринбург – Городская выставка собак всех пород
            </span>
          </p>

          <WinnersCarousel />
        </div>

        <Link to="/results" className="latest-results-button">
          Все результаты
        </Link>
      </section>
    </div>
  );
};

export default HomePage;