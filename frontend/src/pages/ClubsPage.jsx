import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import arrowDown from '../images/arrow-down.png';
import './ClubsPage.css';
import ClubCard from '../components/ClubCard';
import useAuthStore from '../store/authStore';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const ClubsPage = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isAdmin = role === 'Admin';
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityRef = useRef(null);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsRes = await client.get('/clubs');
        setClubs(clubsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cities = useMemo(() => {
    const unique = [...new Set(clubs.map((c) => c.city).filter(Boolean))];
    return unique.sort();
  }, [clubs]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    return cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [cities, citySearch]);

  const filteredClubs = clubs.filter((club) => {
    const matchName = club.name.toLowerCase().includes(searchName.toLowerCase());
    const matchCity = !searchCity || club.city === searchCity;
    return matchName && matchCity;
  });

  return (
    <div className="clubs-page">
      <section className="clubs-hero">
        <img className="clubs-hero-paws clubs-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="clubs-hero-paws clubs-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="clubs-hero-title">КЛУБЫ</h1>
      </section>

      <div className="clubs-toolbar">
        <div className="clubs-filters">
          <div className="clubs-filter">
            <label className="clubs-filter-label">Название</label>
            <div className="clubs-filter-select">
              <input
                className="clubs-filter-input"
                type="text"
                placeholder="Введите название клуба"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>

          <div className="clubs-filter" ref={cityRef}>
            <label className="clubs-filter-label">Город</label>
            <button
              type="button"
              className={`clubs-filter-select clubs-filter-select--clickable ${isCityOpen ? 'clubs-filter-select--open' : ''}`}
              onClick={() => setIsCityOpen(!isCityOpen)}
            >
              {isCityOpen ? (
                <input
                  className="clubs-filter-search"
                  type="text"
                  placeholder="Поиск города..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="clubs-filter-value">
                  {searchCity || 'Все города'}
                </span>
              )}
              <img className="clubs-filter-arrow" src={arrowDown} alt="" />
            </button>
            {isCityOpen && (
              <ul className="clubs-filter-dropdown">
                <li
                  className={`clubs-filter-option ${!searchCity ? 'clubs-filter-option--active' : ''}`}
                  onClick={() => { setSearchCity(''); setCitySearch(''); setIsCityOpen(false); }}
                >
                  Все города
                </li>
                {filteredCities.map((city) => (
                  <li
                    key={city}
                    className={`clubs-filter-option ${searchCity === city ? 'clubs-filter-option--active' : ''}`}
                    onClick={() => { setSearchCity(city); setCitySearch(''); setIsCityOpen(false); }}
                  >
                    {city}
                  </li>
                ))}
                {citySearch.trim() && filteredCities.length === 0 && (
                  <li className="clubs-filter-option clubs-filter-option--empty">Ничего не найдено</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {isAdmin && (
          <button className="clubs-register-button" onClick={() => navigate('/admin/clubs/create')}>
            Добавить клуб
          </button>
        )}
      </div>

      <div className="clubs-grid">
        {filteredClubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
        {filteredClubs.length === 0 && (
          <p className="clubs-empty">Клубы не найдены</p>
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

export default ClubsPage;