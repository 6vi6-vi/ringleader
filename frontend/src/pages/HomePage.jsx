import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import pawIcon from '../images/paw.png';
import WinnersCarousel from '../components/WinnersCarousel';
import './HomePage.css';

const HomePage = () => {
  const [upcomingExhibitions, setUpcomingExhibitions] = useState([]);
  const [latestResults, setLatestResults] = useState(null);
  const [latestExhibition, setLatestExhibition] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await client.get('/exhibitions');
      const exhibitions = res.data;
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = exhibitions
        .filter((ex) => {
          const exDate = new Date(ex.date);
          exDate.setHours(0, 0, 0, 0);
          return exDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      setUpcomingExhibitions(upcoming);

      const past = exhibitions
        .filter((ex) => {
          const exDate = new Date(ex.date);
          exDate.setHours(0, 0, 0, 0);
          return exDate < now;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (past.length > 0) {
        const lastEx = past[0];
        setLatestExhibition(lastEx);
        try {
          const resultsRes = await client.get(`/results/exhibition/${lastEx.id}`);
          setLatestResults(resultsRes.data.filter((r) => r.place));
        } catch (err) {}
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="home-page">
      <section className="hero">
        <img className="hero-paws hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="hero-paws hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="hero-title">Добро пожаловать на RINGLEADER!</h1>
      </section>

      <section className="about">
        <h2 className="about-title">О НАС</h2>
        <div className="about-content">
          <span className="about-brand">RINGLEADER</span> — это информационная система для организации и проведения выставок собак.
          Здесь вы можете зарегистрировать своих питомцев, подать заявку на участие в выставке, отслеживать результаты и достижения. 
        </div>
      </section>

      <section className="upcoming-exhibitions">
        <h2 className="upcoming-exhibitions-title">БЛИЖАЙШИЕ ВЫСТАВКИ</h2>
        {upcomingExhibitions.length > 0 ? (
          <ul className="upcoming-exhibitions-list">
            {upcomingExhibitions.map((ex) => (
              <li key={ex.id} className="upcoming-exhibitions-item">
                <img className="upcoming-exhibitions-paw" src={pawIcon} alt="" />
                <span className="upcoming-exhibitions-text">
                  {formatDate(ex.date)} — {ex.address || 'Адрес не указан'} — {ex.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="upcoming-exhibitions-empty">Нет предстоящих выставок</p>
        )}
        <Link to="/exhibitions" className="upcoming-exhibitions-button">
          Все выставки
        </Link>
      </section>

      {latestExhibition && latestResults && latestResults.length > 0 && (
        <section className="latest-results">
          <h2 className="latest-results-title">ПОБЕДИТЕЛИ ПОСЛЕДНЕЙ ВЫСТАВКИ</h2>
          <p className="latest-results-exhibition">
            <span className="latest-results-exhibition-label">Выставка: </span>
            <span className="latest-results-exhibition-name">
              {latestExhibition.name} ({formatDate(latestExhibition.date)})
            </span>
          </p>

          <WinnersCarousel
            breedsData={Object.entries(
              latestResults.reduce((acc, r) => {
                const breed = r.breed_name || 'Без породы';
                if (!acc[breed]) acc[breed] = [];
                acc[breed].push(r);
                return acc;
              }, {})
            ).map(([breed, winners]) => ({
              breedName: breed,
              winners,
            }))}
          />

          <Link
            to={`/exhibitions/${latestExhibition.id}`}
            className="latest-results-button"
          >
            Подробнее
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage;