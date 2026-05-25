import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import arrowDown from '../images/arrow-down.png';
import './ExhibitionsPage.css';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const ExhibitionsPage = () => {
  const { isAuthenticated } = useAuthStore();

  const [exhibitions, setExhibitions] = useState([]);
  const [tab, setTab] = useState('upcoming'); // upcoming | past

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await client.get('/exhibitions');
        setExhibitions(res.data);
      } catch (err) {
        console.error('Ошибка загрузки выставок:', err);
      }
    };
    fetchExhibitions();
  }, []);

  const now = new Date();

  const upcomingExhibitions = exhibitions.filter((ex) => {
    const exDate = new Date(ex.date);
    exDate.setHours(23, 59, 59, 999);
    return exDate >= now;
  });

  const pastExhibitions = exhibitions.filter((ex) => {
    const exDate = new Date(ex.date);
    exDate.setHours(23, 59, 59, 999);
    return exDate < now;
  });

  const displayedExhibitions = tab === 'upcoming' ? upcomingExhibitions : pastExhibitions;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleApplyClick = () => {
    if (isAuthenticated) {
      // Открыть модалку подачи заявки
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleResultsClick = (exhibitionId) => {
    // Открыть модалку с результатами
  };

  return (
    <div className="exhibitions-page">
      <section className="exhibitions-hero">
        <img className="exhibitions-hero-paws exhibitions-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="exhibitions-hero-paws exhibitions-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="exhibitions-hero-title">ВЫСТАВКИ</h1>
      </section>

      <div className="exhibitions-tabs">
        <button
          className={`exhibitions-tab ${tab === 'upcoming' ? 'exhibitions-tab--active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Будущие
        </button>
        <button
          className={`exhibitions-tab ${tab === 'past' ? 'exhibitions-tab--active' : ''}`}
          onClick={() => setTab('past')}
        >
          Прошедшие
        </button>
      </div>

      <div className="exhibitions-grid">
        {displayedExhibitions.map((ex) => (
          <div key={ex.id} className="exhibition-card">
            <div className="exhibition-card-header">
              <h3 className="exhibition-card-title">{ex.name}</h3>
            </div>
            <div className="exhibition-card-info">
              <p className="exhibition-card-row">
                <span className="exhibition-card-label">Дата: </span>
                <span className="exhibition-card-value">{formatDate(ex.date)}</span>
              </p>
              {ex.address && (
                <p className="exhibition-card-row">
                  <span className="exhibition-card-label">Адрес: </span>
                  <span className="exhibition-card-value">{ex.address}</span>
                </p>
              )}
            </div>
            {tab === 'upcoming' && (
              <button className="exhibition-card-button" onClick={handleApplyClick}>
                Подать заявку
              </button>
            )}
            {tab === 'past' && (
              <button className="exhibition-card-button" onClick={() => handleResultsClick(ex.id)}>
                Посмотреть результаты
              </button>
            )}
          </div>
        ))}
        {displayedExhibitions.length === 0 && (
          <p className="exhibitions-empty">
            {tab === 'upcoming' ? 'Нет предстоящих выставок' : 'Нет прошедших выставок'}
          </p>
        )}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
      />
    </div>
  );
};

export default ExhibitionsPage;