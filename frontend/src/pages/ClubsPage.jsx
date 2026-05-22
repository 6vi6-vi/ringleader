import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import './ClubsPage.css';
import ClubCard from '../components/ClubCard';

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [searchName, setSearchName] = useState('');

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

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="clubs-page">
      <section className="clubs-hero">
        <img
          className="clubs-hero-paws clubs-hero-paws--left"
          src={pawsPatternLeft}
          alt=""
        />
        <img
          className="clubs-hero-paws clubs-hero-paws--right"
          src={pawsPatternRight}
          alt=""
        />
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
        </div>

        <button className="clubs-register-button">
          Подать заявку на создание клуба
        </button>
      </div>

      <div className="clubs-grid">
        <ClubCard
          club={{
            name: 'Чёрный плащ',
            description: 'Клуб служебных и охранных пород',
            chairman_name: 'Кириллов А. С.',
          }}
        />
        <ClubCard
          club={{
            name: 'Белый клык',
            description: 'Клуб охотничьих пород',
            chairman_name: 'Петров П. П.',
          }}
        />
        <ClubCard
          club={{
            name: 'Золотой ринг',
            description: 'Объединённый клуб декоративных пород',
            chairman_name: 'Сидорова А. В.',
          }}
        />
        <ClubCard
          club={{
            name: 'Малахит',
            description: 'Клуб спортивных и пастушьих пород',
            chairman_name: 'Медведева О. Д.',
          }}
        />
        <ClubCard
          club={{
            name: 'Северный ветер',
            description: 'Клуб северных ездовых пород',
            chairman_name: 'Кузнецов Д. М.',
          }}
        />
        <ClubCard
          club={{
            name: 'Янтарный гребень',
            description: 'Клуб терьеров и норных пород',
            chairman_name: null,
          }}
        />
      </div>
    </div>
  );
};

export default ClubsPage;