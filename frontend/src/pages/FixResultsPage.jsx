import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import arrowDown from '../images/arrow-down.png';
import './FixResultsPage.css';

const PLACE_OPTIONS = [
  { value: '', label: '—' },
  { value: '1', label: '1 место' },
  { value: '2', label: '2 место' },
  { value: '3', label: '3 место' },
];

const FixResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdmin = role === 'Admin';

  const [exhibition, setExhibition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchData();
  }, [id, isAdmin]);

  const fetchData = async () => {
    try {
      const res = await client.get(`/exhibitions/${id}`);
      setExhibition(res.data);
      setParticipants(res.data.participants || []);
      try {
        const resultsRes = await client.get(`/results/exhibition/${id}`);
        const existing = {};
        resultsRes.data.forEach((r) => {
          if (r.place) existing[r.dog_id] = String(r.place);
        });
        setResults(existing);
      } catch (err) {}
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedByBreed = useMemo(() => {
    const grouped = {};
    participants.forEach((p) => {
      const breed = p.breed_name || 'Без породы';
      if (!grouped[breed]) grouped[breed] = [];
      grouped[breed].push(p);
    });
    return Object.entries(grouped);
  }, [participants]);

  const handlePlaceChange = (dogId, value) => {
    setResults((prev) => ({ ...prev, [dogId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      for (const [dogId, place] of Object.entries(results)) {
        await client.post('/results', {
          dog_id: parseInt(dogId),
          exhibition_id: parseInt(id),
          place: place ? parseInt(place) : null,
        });
      }
      setSuccess('Результаты сохранены!');
      setTimeout(() => navigate(`/exhibitions/${id}`), 500);
    } catch (err) {
      setError('Ошибка при сохранении результатов');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="fix-results-page"><p className="fix-results-loading">Загрузка...</p></div>;

  return (
    <div className="fix-results-page">
      <section className="fix-results-hero">
        <img className="fix-results-hero-paws fix-results-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="fix-results-hero-paws fix-results-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="fix-results-hero-title">ФИКСАЦИЯ РЕЗУЛЬТАТОВ</h1>
      </section>

      <p className="fix-results-exhibition-name">
        <span className="fix-results-exhibition-label">Выставка: </span>
        {exhibition?.name} ({formatDate(exhibition?.date)})
      </p>

      <form onSubmit={handleSubmit}>
        {groupedByBreed.length > 0 ? (
          <div className="fix-results-breeds">
            {groupedByBreed.map(([breed, dogs]) => (
              <section key={breed} className="fix-results-breed-section">
                <h2 className="fix-results-breed-title">{breed}</h2>
                <div className="fix-results-dogs-grid">
                  {dogs.map((p) => (
                    <DogResultCard
                      key={p.dog_id}
                      participant={p}
                      selectedPlace={results[p.dog_id] || ''}
                      onPlaceChange={handlePlaceChange}
                      onNavigate={(dogId) => navigate(`/dogs/${dogId}`)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="fix-results-empty">Нет участников для распределения</p>
        )}

        {error && <p className="fix-results-error">{error}</p>}
        {success && <p className="fix-results-success">{success}</p>}

        <div className="fix-results-buttons">
          <button type="button" className="fix-results-cancel" onClick={() => navigate(`/exhibitions/${id}`)}>
            Назад
          </button>
          {participants.length > 0 && (
            <button type="submit" className="fix-results-submit">Сохранить результаты</button>
          )}
        </div>
      </form>
    </div>
  );
};

const DogResultCard = ({ participant, selectedPlace, onPlaceChange, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = PLACE_OPTIONS.find((o) => o.value === selectedPlace)?.label || '—';

  return (
    <div className="fix-results-dog-card" onClick={() => onNavigate(participant.dog_id)}>
      <img
        className="fix-results-dog-photo"
        src={participant.dog_photo_url || dogPlaceholder}
        alt={participant.dog_name}
      />
      <span className="fix-results-dog-name">{participant.dog_name}</span>
      <span className="fix-results-dog-owner">{participant.owner_name}</span>
      <div className="fix-results-place-wrapper" ref={selectRef}>
        <button
          type="button"
          className={`fix-results-place-select ${isOpen ? 'fix-results-place-select--open' : ''}`}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        >
          <span className="fix-results-place-value">{selectedLabel}</span>
          <img className="fix-results-place-arrow" src={arrowDown} alt="" />
        </button>
        {isOpen && (
          <ul className="fix-results-place-dropdown">
            {PLACE_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                className={`fix-results-place-option ${selectedPlace === opt.value ? 'fix-results-place-option--active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaceChange(participant.dog_id, opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FixResultsPage;