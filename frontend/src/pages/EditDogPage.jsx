import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import arrowDown from '../images/arrow-down.png';
import './EditDogPage.css';

const EditDogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [breeds, setBreeds] = useState([]);
  const [clubs, setClubs] = useState([]);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
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
  const [loading, setLoading] = useState(true);

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
        const [dogRes, breedsRes, clubsRes] = await Promise.all([
          client.get(`/dogs/${id}`),
          client.get('/breeds'),
          client.get('/clubs'),
        ]);
        const dog = dogRes.data;
        setName(dog.name);
        setBreedId(String(dog.breed_id));
        setAge(String(dog.age));
        setPedigreeNumber(dog.pedigree_number || '');
        setFatherName(dog.father_name || '');
        setMotherName(dog.mother_name || '');
        setLastVaccinationDate(dog.last_vaccination_date || '');
        setClubId(dog.club_id ? String(dog.club_id) : '');
        setExistingPhotoUrl(dog.photo_url);
        setBreeds(breedsRes.data);
        setClubs(clubsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, navigate]);

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

    if (lastVaccinationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vacDate = new Date(lastVaccinationDate);
      vacDate.setHours(0, 0, 0, 0);
      if (vacDate > today) {
        setError('Дата прививки не может быть в будущем');
        return;
      }
    }

    try {
      await client.put(`/dogs/${id}`, {
        name: name.trim(),
        breed_id: parseInt(breedId),
        age: parseInt(age),
        pedigree_number: pedigreeNumber.trim() || null,
        father_name: fatherName.trim() || null,
        mother_name: motherName.trim() || null,
        last_vaccination_date: lastVaccinationDate || null,
        club_id: clubId ? parseInt(clubId) : null,
      });

      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);
        await client.post(`/dogs/${id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess('Данные обновлены!');
      setTimeout(() => navigate(`/dogs/${id}`, { state: { from: 'edit' } }), 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении данных');
    }
  };

  if (loading) {
    return (
      <div className="edit-dog-page">
        <p className="edit-dog-loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="edit-dog-page">
      <section className="edit-dog-hero">
        <img className="edit-dog-hero-paws edit-dog-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="edit-dog-hero-paws edit-dog-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="edit-dog-hero-title">РЕДАКТИРОВАНИЕ ПРОФИЛЯ</h1>
      </section>

      <form className="edit-dog-form" onSubmit={handleSubmit}>
        <div className="edit-dog-columns">
          <div className="edit-dog-photo-section">
            <img
              className="edit-dog-photo"
              src={photoPreview || existingPhotoUrl || dogPlaceholder}
              alt="Фото собаки"
            />
            <label className="edit-dog-photo-button">
              Изменить фото
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>

          <div className="edit-dog-fields">
            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogName">Кличка</label>
              <input id="dogName" className="edit-dog-input" type="text" placeholder="Введите кличку" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="edit-dog-field" ref={breedRef}>
              <label className="edit-dog-label">Порода</label>
              <button type="button" className={`edit-dog-select ${isBreedOpen ? 'edit-dog-select--open' : ''}`} onClick={() => { setIsBreedOpen(!isBreedOpen); setIsClubOpen(false); }}>
                {isBreedOpen ? (
                  <input ref={breedInputRef} className="edit-dog-select-search" type="text" placeholder="Поиск породы..." value={breedSearch} onChange={(e) => setBreedSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                ) : (
                  <span className={`edit-dog-select-value ${!breedId ? 'edit-dog-select-placeholder' : ''}`}>{selectedBreedName || 'Выберите породу'}</span>
                )}
                <img className="edit-dog-select-arrow" src={arrowDown} alt="" />
              </button>
              {isBreedOpen && (
                <ul className="edit-dog-dropdown">
                  {filteredBreeds.map((breed) => (
                    <li key={breed.id} className={`edit-dog-dropdown-option ${parseInt(breedId) === breed.id ? 'edit-dog-dropdown-option--active' : ''}`} onClick={() => { setBreedId(String(breed.id)); setIsBreedOpen(false); setBreedSearch(''); }}>{breed.name}</li>
                  ))}
                  {filteredBreeds.length === 0 && <li className="edit-dog-dropdown-option edit-dog-dropdown-option--empty">Ничего не найдено</li>}
                </ul>
              )}
            </div>

            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogAge">Возраст</label>
              <input id="dogAge" className="edit-dog-input" type="number" placeholder="Введите возраст" min="0" max="30" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>

            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogPedigree">Номер родословной</label>
              <input id="dogPedigree" className="edit-dog-input" type="text" placeholder="Введите номер родословной" value={pedigreeNumber} onChange={(e) => setPedigreeNumber(e.target.value)} />
            </div>

            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogFather">Кличка отца</label>
              <input id="dogFather" className="edit-dog-input" type="text" placeholder="Введите кличку отца" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>

            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogMother">Кличка матери</label>
              <input id="dogMother" className="edit-dog-input" type="text" placeholder="Введите кличку матери" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>

            <div className="edit-dog-field">
              <label className="edit-dog-label" htmlFor="dogVaccination">Дата последней прививки</label>
              <input id="dogVaccination" className="edit-dog-input" type="date" value={lastVaccinationDate} onChange={(e) => setLastVaccinationDate(e.target.value)} />
            </div>

            <div className="edit-dog-field" ref={clubRef}>
              <label className="edit-dog-label">Клуб</label>
              <button type="button" className={`edit-dog-select ${isClubOpen ? 'edit-dog-select--open' : ''}`} onClick={() => { setIsClubOpen(!isClubOpen); setIsBreedOpen(false); }}>
                {isClubOpen ? (
                  <input ref={clubInputRef} className="edit-dog-select-search" type="text" placeholder="Поиск клуба..." value={clubSearch} onChange={(e) => setClubSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                ) : (
                  <span className="edit-dog-select-value">{selectedClubName || 'Без клуба'}</span>
                )}
                <img className="edit-dog-select-arrow" src={arrowDown} alt="" />
              </button>
              {isClubOpen && (
                <ul className="edit-dog-dropdown">
                  <li className={`edit-dog-dropdown-option ${!clubId ? 'edit-dog-dropdown-option--active' : ''}`} onClick={() => { setClubId(''); setIsClubOpen(false); setClubSearch(''); }}>Без клуба</li>
                  {filteredClubs.map((club) => (
                    <li key={club.id} className={`edit-dog-dropdown-option ${parseInt(clubId) === club.id ? 'edit-dog-dropdown-option--active' : ''}`} onClick={() => { setClubId(String(club.id)); setIsClubOpen(false); setClubSearch(''); }}>{club.name}</li>
                  ))}
                  {filteredClubs.length === 0 && <li className="edit-dog-dropdown-option edit-dog-dropdown-option--empty">Ничего не найдено</li>}
                </ul>
              )}
            </div>
          </div>
        </div>

        {error && <p className="edit-dog-error">{error}</p>}
        {success && <p className="edit-dog-success">{success}</p>}

        <div className="edit-dog-buttons">
          <button type="button" className="edit-dog-cancel" onClick={() => navigate(`/dogs/${id}`)}>Отмена</button>
          <button type="submit" className="edit-dog-submit">Сохранить</button>
        </div>
      </form>
    </div>
  );
};

export default EditDogPage;