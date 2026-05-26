import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import arrowDown from '../images/arrow-down.png';
import './AddDogPage.css';

const AddDogPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from || '/dogs';

  const [breeds, setBreeds] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [name, setName] = useState('');
  const [breedId, setBreedId] = useState('');
  const [breedSearch, setBreedSearch] = useState('');
  const [isBreedOpen, setIsBreedOpen] = useState(false);
  const [age, setAge] = useState('');
  const [pedigreeNumber, setPedigreeNumber] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [lastVaccinationDate, setLastVaccinationDate] = useState('');
  const [clubId, setClubId] = useState('');
  const [clubSearch, setClubSearch] = useState('');
  const [isClubOpen, setIsClubOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const breedRef = useRef(null);
  const clubRef = useRef(null);
  const breedInputRef = useRef(null);
  const clubInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (breedRef.current && !breedRef.current.contains(e.target)) setIsBreedOpen(false);
      if (clubRef.current && !clubRef.current.contains(e.target)) setIsClubOpen(false);
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

  const selectedBreedName = breeds.find((b) => b.id === parseInt(breedId))?.name;
  const selectedClubName = clubs.find((c) => c.id === parseInt(clubId))?.name;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Введите кличку'); return; }
    if (!breedId) { setError('Выберите породу'); return; }
    if (!age || age < 0 || age > 30) { setError('Укажите возраст (от 0 до 30)'); return; }

    try {
      const response = await client.post('/dogs', {
        name: name.trim(),
        breed_id: parseInt(breedId),
        age: parseInt(age),
        pedigree_number: pedigreeNumber.trim() || null,
        father_name: fatherName.trim() || null,
        mother_name: motherName.trim() || null,
        last_vaccination_date: lastVaccinationDate || null,
        club_id: clubId ? parseInt(clubId) : null,
      });

      const dogId = response.data.id;

      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);
        await client.post(`/dogs/${dogId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess('Собака успешно зарегистрирована!');
      setTimeout(() => navigate(from), 600);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации собаки');
    }
  };

  return (
    <div className="add-dog-page">
      {/* ── Герой ── */}
      <section className="add-dog-hero">
        <img className="add-dog-hero-paws add-dog-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="add-dog-hero-paws add-dog-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="add-dog-hero-title">РЕГИСТРАЦИЯ СОБАКИ</h1>
      </section>

      {/* ── Форма ── */}
      <form className="add-dog-form" onSubmit={handleSubmit}>
        <div className="add-dog-columns">
          {/* Левая колонка — фото */}
          <div className="add-dog-photo-section">
            <img
              className="add-dog-photo"
              src={photoPreview || dogPlaceholder}
              alt="Фото собаки"
            />
            <label className="add-dog-photo-button">
              Загрузить фото
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>

          {/* Правая колонка — поля */}
          <div className="add-dog-fields">
            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogName">Кличка</label>
                <input id="dogName" className="add-dog-input" type="text" placeholder="Введите кличку" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="add-dog-field" ref={breedRef}>
                <label className="add-dog-label">Порода</label>
                <button type="button" className={`add-dog-select ${isBreedOpen ? 'add-dog-select--open' : ''}`} onClick={() => { setIsBreedOpen(!isBreedOpen); setIsClubOpen(false); }}>
                {isBreedOpen ? (
                    <input ref={breedInputRef} className="add-dog-select-search" type="text" placeholder="Поиск породы..." value={breedSearch} onChange={(e) => setBreedSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                ) : (
                    <span className={`add-dog-select-value ${!breedId ? 'add-dog-select-placeholder' : ''}`}>{selectedBreedName || 'Выберите породу'}</span>
                )}
                <img className="add-dog-select-arrow" src={arrowDown} alt="" />
                </button>
                {isBreedOpen && (
                <ul className="add-dog-dropdown">
                    {filteredBreeds.map((breed) => (
                    <li key={breed.id} className={`add-dog-dropdown-option ${parseInt(breedId) === breed.id ? 'add-dog-dropdown-option--active' : ''}`} onClick={() => { setBreedId(String(breed.id)); setIsBreedOpen(false); setBreedSearch(''); }}>{breed.name}</li>
                    ))}
                    {filteredBreeds.length === 0 && <li className="add-dog-dropdown-option add-dog-dropdown-option--empty">Ничего не найдено</li>}
                </ul>
                )}
            </div>

            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogAge">Возраст</label>
                <input id="dogAge" className="add-dog-input" type="number" placeholder="Введите возраст" min="0" max="30" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>

            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogPedigree">Номер родословной</label>
                <input id="dogPedigree" className="add-dog-input" type="text" placeholder="Введите номер родословной" value={pedigreeNumber} onChange={(e) => setPedigreeNumber(e.target.value)} />
            </div>

            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogFather">Кличка отца</label>
                <input id="dogFather" className="add-dog-input" type="text" placeholder="Введите кличку отца" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>

            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogMother">Кличка матери</label>
                <input id="dogMother" className="add-dog-input" type="text" placeholder="Введите кличку матери" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>

            <div className="add-dog-field">
                <label className="add-dog-label" htmlFor="dogVaccination">Дата последней прививки</label>
                <input id="dogVaccination" className="add-dog-input" type="date" value={lastVaccinationDate} onChange={(e) => setLastVaccinationDate(e.target.value)} />
            </div>

            <div className="add-dog-field" ref={clubRef}>
                <label className="add-dog-label">Клуб</label>
                <button type="button" className={`add-dog-select ${isClubOpen ? 'add-dog-select--open' : ''}`} onClick={() => { setIsClubOpen(!isClubOpen); setIsBreedOpen(false); }}>
                {isClubOpen ? (
                    <input ref={clubInputRef} className="add-dog-select-search" type="text" placeholder="Поиск клуба..." value={clubSearch} onChange={(e) => setClubSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                ) : (
                    <span className="add-dog-select-value">{selectedClubName || 'Без клуба'}</span>
                )}
                <img className="add-dog-select-arrow" src={arrowDown} alt="" />
                </button>
                {isClubOpen && (
                <ul className="add-dog-dropdown">
                    <li className={`add-dog-dropdown-option ${!clubId ? 'add-dog-dropdown-option--active' : ''}`} onClick={() => { setClubId(''); setIsClubOpen(false); setClubSearch(''); }}>Без клуба</li>
                    {filteredClubs.map((club) => (
                    <li key={club.id} className={`add-dog-dropdown-option ${parseInt(clubId) === club.id ? 'add-dog-dropdown-option--active' : ''}`} onClick={() => { setClubId(String(club.id)); setIsClubOpen(false); setClubSearch(''); }}>{club.name}</li>
                    ))}
                    {filteredClubs.length === 0 && <li className="add-dog-dropdown-option add-dog-dropdown-option--empty">Ничего не найдено</li>}
                </ul>
                )}
            </div>
            </div>
        </div>

        {error && <p className="add-dog-error">{error}</p>}
        {success && <p className="add-dog-success">{success}</p>}

        <div className="add-dog-buttons">
            <button type="button" className="add-dog-cancel" onClick={() => navigate(from)}>
                Отмена
            </button>
            <button type="submit" className="add-dog-submit">
                Зарегистрировать
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddDogPage;