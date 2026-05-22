import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import arrowDown from '../images/arrow-down.png';
import './DogsPage.css';
import DogCard from '../components/DogCard';

const DogsPage = () => {
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

  // Загрузка пород и клубов
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

  // Закрытие при клике вне
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

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isBreedOpen && breedInputRef.current) {
      breedInputRef.current.focus();
    }
  }, [isBreedOpen]);

  useEffect(() => {
    if (isClubOpen && clubInputRef.current) {
      clubInputRef.current.focus();
    }
  }, [isClubOpen]);

  // Фильтрация с учётом поиска
  const filteredBreeds = breeds.filter((breed) =>
    breed.name.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(clubSearch.toLowerCase())
  );

  // Сброс поиска при закрытии
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
    <div className="dogs-page">
      {/* ── Герой ── */}
      <section className="dogs-hero">
        <img
          className="dogs-hero-paws dogs-hero-paws--left"
          src={pawsPatternLeft}
          alt=""
        />
        <img
          className="dogs-hero-paws dogs-hero-paws--right"
          src={pawsPatternRight}
          alt=""
        />
        <h1 className="dogs-hero-title">СОБАКИ</h1>
      </section>

      {/* ── Панель фильтров ── */}
      <div className="dogs-toolbar">
        <div className="dogs-filters">
          {/* Фильтр по породе */}
          <div className="dogs-filter" ref={breedRef}>
            <label className="dogs-filter-label">Порода</label>
            <button
              className={`dogs-filter-select dogs-filter-select--clickable ${isBreedOpen ? 'dogs-filter-select--open' : ''}`}
              onClick={handleBreedToggle}
            >
              {isBreedOpen ? (
                <input
                  ref={breedInputRef}
                  className="dogs-filter-search"
                  type="text"
                  placeholder="Поиск породы..."
                  value={breedSearch}
                  onChange={(e) => setBreedSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="dogs-filter-value">
                  {selectedBreed ? selectedBreed.name : 'Все породы'}
                </span>
              )}
              <img className="dogs-filter-arrow" src={arrowDown} alt="" />
            </button>
            {isBreedOpen && (
              <ul className="dogs-filter-dropdown">
                {filteredBreeds.map((breed) => (
                  <li
                    key={breed.id}
                    className={`dogs-filter-option ${selectedBreed?.id === breed.id ? 'dogs-filter-option--active' : ''}`}
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
                  <li className="dogs-filter-option dogs-filter-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Фильтр по клубу */}
          <div className="dogs-filter" ref={clubRef}>
            <label className="dogs-filter-label">Клуб</label>
            <button
              className={`dogs-filter-select dogs-filter-select--clickable ${isClubOpen ? 'dogs-filter-select--open' : ''}`}
              onClick={handleClubToggle}
            >
              {isClubOpen ? (
                <input
                  ref={clubInputRef}
                  className="dogs-filter-search"
                  type="text"
                  placeholder="Поиск клуба..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="dogs-filter-value">
                  {selectedClub ? selectedClub.name : 'Все клубы'}
                </span>
              )}
              <img className="dogs-filter-arrow" src={arrowDown} alt="" />
            </button>
            {isClubOpen && (
              <ul className="dogs-filter-dropdown">
                {filteredClubs.map((club) => (
                  <li
                    key={club.id}
                    className={`dogs-filter-option ${selectedClub?.id === club.id ? 'dogs-filter-option--active' : ''}`}
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
                  <li className="dogs-filter-option dogs-filter-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Фильтр по кличке */}
          <div className="dogs-filter">
            <label className="dogs-filter-label">Кличка</label>
            <div className="dogs-filter-select">
              <input
                className="dogs-filter-input"
                type="text"
                placeholder="Введите кличку"
              />
            </div>
          </div>
        </div>

        <Link to="/dogs/register" className="dogs-register-button">
          Зарегистрировать собаку
        </Link>
      </div>

      {/* ── Сетка карточек собак ── */}
      <div className="dogs-grid">
        {/* Временные данные для демонстрации, позже будут подгружаться с бэкенда */}
        <DogCard
          dog={{
            name: 'Рекс',
            breed_name: 'Немецкая овчарка',
            owner_name: 'Медведева О. Д.',
            club_name: 'Малахит',
          }}
        />
        <DogCard
          dog={{
            name: 'Лорд',
            breed_name: 'Лабрадор',
            owner_name: 'Петров П. П.',
            club_name: 'Белый клык',
          }}
        />
        <DogCard
          dog={{
            name: 'Грета',
            breed_name: 'Такса',
            owner_name: 'Сидорова А. В.',
            club_name: 'Золотой ринг',
          }}
        />
        <DogCard
          dog={{
            name: 'Арчи',
            breed_name: 'Сибирский хаски',
            owner_name: 'Кузнецов Д. М.',
            club_name: null,
          }}
        />
        <DogCard
          dog={{
            name: 'Белла',
            breed_name: 'Пудель',
            owner_name: 'Иванов И. И.',
            club_name: 'Чёрный плащ',
          }}
        />
        <DogCard
          dog={{
            name: 'Тор',
            breed_name: 'Немецкая овчарка',
            owner_name: 'Петров П. П.',
            club_name: 'Белый клык',
          }}
        />
      </div>
    </div>
  );
};

export default DogsPage;