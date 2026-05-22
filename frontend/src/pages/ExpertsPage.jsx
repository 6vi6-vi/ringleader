import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import arrowDown from '../images/arrow-down.png';
import './ExpertsPage.css';
import ExpertCard from '../components/ExpertCard';

const ExpertsPage = () => {
  const [breeds, setBreeds] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [selectedBreed, setSelectedBreed] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  const [breedSearch, setBreedSearch] = useState('');
  const [clubSearch, setClubSearch] = useState('');

  const [isBreedOpen, setIsBreedOpen] = useState(false);
  const [isClubOpen, setIsClubOpen] = useState(false);

  const breedRef = useRef(null);
  const clubRef = useRef(null);
  const breedInputRef = useRef(null);
  const clubInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [breedsRes, clubsRes] = await Promise.all([
          client.get('/breeds'),
          client.get('/clubs'),
        ]);
        setBreeds(breedsRes.data);
        setClubs(clubsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (breedRef.current && !breedRef.current.contains(e.target)) {
        setIsBreedOpen(false);
      }
      if (clubRef.current && !clubRef.current.contains(e.target)) {
        setIsClubOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isBreedOpen && breedInputRef.current) breedInputRef.current.focus();
  }, [isBreedOpen]);

  useEffect(() => {
    if (isClubOpen && clubInputRef.current) clubInputRef.current.focus();
  }, [isClubOpen]);

  const filteredBreeds = breeds.filter((breed) =>
    breed.name.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(clubSearch.toLowerCase())
  );

  const handleBreedToggle = () => {
    if (isBreedOpen) {
      setIsBreedOpen(false);
      setBreedSearch('');
    } else {
      setIsBreedOpen(true);
      setIsClubOpen(false);
    }
  };

  const handleClubToggle = () => {
    if (isClubOpen) {
      setIsClubOpen(false);
      setClubSearch('');
    } else {
      setIsClubOpen(true);
      setIsBreedOpen(false);
    }
  };

  return (
    <div className="experts-page">
      <section className="experts-hero">
        <img
          className="experts-hero-paws experts-hero-paws--left"
          src={pawsPatternLeft}
          alt=""
        />
        <img
          className="experts-hero-paws experts-hero-paws--right"
          src={pawsPatternRight}
          alt=""
        />
        <h1 className="experts-hero-title">ЭКСПЕРТЫ</h1>
      </section>

      <div className="experts-toolbar">
        <div className="experts-filters">
          <div className="experts-filter">
            <label className="experts-filter-label">ФИО</label>
            <div className="experts-filter-select">
              <input
                className="experts-filter-input"
                type="text"
                placeholder="Введите ФИО"
              />
            </div>
          </div>
          
          <div className="experts-filter" ref={breedRef}>
            <label className="experts-filter-label">Специализация</label>
            <button
              className={`experts-filter-select experts-filter-select--clickable ${isBreedOpen ? 'experts-filter-select--open' : ''}`}
              onClick={handleBreedToggle}
            >
              {isBreedOpen ? (
                <input
                  ref={breedInputRef}
                  className="experts-filter-search"
                  type="text"
                  placeholder="Поиск породы..."
                  value={breedSearch}
                  onChange={(e) => setBreedSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="experts-filter-value">
                  {selectedBreed ? selectedBreed.name : 'Все породы'}
                </span>
              )}
              <img className="experts-filter-arrow" src={arrowDown} alt="" />
            </button>
            {isBreedOpen && (
              <ul className="experts-filter-dropdown">
                {filteredBreeds.map((breed) => (
                  <li
                    key={breed.id}
                    className={`experts-filter-option ${selectedBreed?.id === breed.id ? 'experts-filter-option--active' : ''}`}
                    onClick={() => {
                      setSelectedBreed(breed);
                      setIsBreedOpen(false);
                      setBreedSearch('');
                    }}
                  >
                    {breed.name}
                  </li>
                ))}
                {filteredBreeds.length === 0 && (
                  <li className="experts-filter-option experts-filter-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="experts-filter" ref={clubRef}>
            <label className="experts-filter-label">Клуб</label>
            <button
              className={`experts-filter-select experts-filter-select--clickable ${isClubOpen ? 'experts-filter-select--open' : ''}`}
              onClick={handleClubToggle}
            >
              {isClubOpen ? (
                <input
                  ref={clubInputRef}
                  className="experts-filter-search"
                  type="text"
                  placeholder="Поиск клуба..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="experts-filter-value">
                  {selectedClub ? selectedClub.name : 'Все клубы'}
                </span>
              )}
              <img className="experts-filter-arrow" src={arrowDown} alt="" />
            </button>
            {isClubOpen && (
              <ul className="experts-filter-dropdown">
                {filteredClubs.map((club) => (
                  <li
                    key={club.id}
                    className={`experts-filter-option ${selectedClub?.id === club.id ? 'experts-filter-option--active' : ''}`}
                    onClick={() => {
                      setSelectedClub(club);
                      setIsClubOpen(false);
                      setClubSearch('');
                    }}
                  >
                    {club.name}
                  </li>
                ))}
                {filteredClubs.length === 0 && (
                  <li className="experts-filter-option experts-filter-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          
        </div>

        <button className="experts-register-button">
          Подать заявку на статус эксперта
        </button>
      </div>

      <div className="experts-grid">
        <ExpertCard
          expert={{
            full_name: 'Кириллов Андрей Сергеевич',
            specialization: 'Немецкая овчарка, Ротвейлер',
            club_name: 'Чёрный плащ',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Власова Мария Дмитриевна',
            specialization: 'Лабрадор, Золотистый ретривер',
            club_name: 'Белый клык',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Соколов Павел Николаевич',
            specialization: 'Такса, Бассет-хаунд',
            club_name: 'Золотой ринг',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Григорьева Елена Викторовна',
            specialization: 'Сибирский хаски, Самоед',
            club_name: 'Чёрный плащ',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Алексеев Дмитрий Игоревич',
            specialization: 'Пудель, Йоркширский терьер',
            club_name: null,
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Морозова Ольга Станиславовна',
            specialization: 'Английский бульдог, Мопс',
            club_name: 'Золотой ринг',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Никонов Владимир Петрович',
            specialization: 'Немецкая овчарка, Колли',
            club_name: 'Чёрный плащ',
          }}
        />
        <ExpertCard
          expert={{
            full_name: 'Смирнова Татьяна Александровна',
            specialization: 'Лабрадор, Такса',
            club_name: 'Белый клык',
          }}
        />
      </div>
    </div>
  );
};

export default ExpertsPage;