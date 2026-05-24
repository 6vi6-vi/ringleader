import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import closeIcon from '../images/close.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import arrowDown from '../images/arrow-down.png';
import './AddDogModal.css';

const AddDogModal = ({ isOpen, onClose }) => {
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
  const breedButtonRef = useRef(null);
  const clubButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPhoto(null);
      setPhotoPreview(null);
      setName('');
      setBreedId('');
      setBreedSearch('');
      setIsBreedOpen(false);
      setAge('');
      setPedigreeNumber('');
      setFatherName('');
      setMotherName('');
      setLastVaccinationDate('');
      setClubId('');
      setClubSearch('');
      setIsClubOpen(false);
      setError('');
      setSuccess('');

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
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации собаки');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getDropdownStyle = (buttonRef) => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
      zIndex: 300,
    };
  };

  return (
    <div className="add-dog-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-dog-modal">
        <div className="add-dog-modal-header">
          <h2 className="add-dog-modal-title">Регистрация собаки</h2>
          <button className="add-dog-modal-close" onClick={onClose}>
            <img src={closeIcon} alt="Закрыть" />
          </button>
        </div>

        <form className="add-dog-modal-form" onSubmit={handleSubmit}>
          {/* Фото */}
          <div className="add-dog-modal-photo-section">
            <img
              className="add-dog-modal-photo"
              src={photoPreview || dogPlaceholder}
              alt="Фото собаки"
            />
            <label className="add-dog-modal-photo-button">
              Загрузить фото
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          {/* Кличка */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogName">Кличка</label>
            <input
              id="dogName"
              className="add-dog-modal-input"
              type="text"
              placeholder="Введите кличку"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Порода */}
          <div className="add-dog-modal-field" ref={breedRef}>
            <label className="add-dog-modal-label">Порода</label>
            <button
              ref={breedButtonRef}
              type="button"
              className={`add-dog-modal-select ${isBreedOpen ? 'add-dog-modal-select--open' : ''}`}
              onClick={() => {
                setIsBreedOpen(!isBreedOpen);
                setIsClubOpen(false);
              }}
            >
              {isBreedOpen ? (
                <input
                  ref={breedInputRef}
                  className="add-dog-modal-search"
                  type="text"
                  placeholder="Поиск породы..."
                  value={breedSearch}
                  onChange={(e) => setBreedSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={`add-dog-modal-select-value ${!breedId ? 'add-dog-modal-select-placeholder' : ''}`}>
                  {selectedBreedName || 'Выберите породу'}
                </span>
              )}
              <img className="add-dog-modal-select-arrow" src={arrowDown} alt="" />
            </button>
            {isBreedOpen && (
              <ul className="add-dog-modal-dropdown" style={getDropdownStyle(breedButtonRef)}>
                {filteredBreeds.map((breed) => (
                  <li
                    key={breed.id}
                    className={`add-dog-modal-option ${parseInt(breedId) === breed.id ? 'add-dog-modal-option--active' : ''}`}
                    onClick={() => {
                      setBreedId(String(breed.id));
                      setIsBreedOpen(false);
                      setBreedSearch('');
                    }}
                  >
                    {breed.name}
                  </li>
                ))}
                {filteredBreeds.length === 0 && (
                  <li className="add-dog-modal-option add-dog-modal-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Возраст */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogAge">Возраст</label>
            <input
              id="dogAge"
              className="add-dog-modal-input"
              type="number"
              placeholder="Введите возраст"
              min="0"
              max="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          {/* Номер родословной */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogPedigree">Номер родословной</label>
            <input
              id="dogPedigree"
              className="add-dog-modal-input"
              type="text"
              placeholder="Введите номер родословной"
              value={pedigreeNumber}
              onChange={(e) => setPedigreeNumber(e.target.value)}
            />
          </div>

          {/* Отец */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogFather">Кличка отца</label>
            <input
              id="dogFather"
              className="add-dog-modal-input"
              type="text"
              placeholder="Введите кличку отца"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />
          </div>

          {/* Мать */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogMother">Кличка матери</label>
            <input
              id="dogMother"
              className="add-dog-modal-input"
              type="text"
              placeholder="Введите кличку матери"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
            />
          </div>

          {/* Дата последней прививки */}
          <div className="add-dog-modal-field">
            <label className="add-dog-modal-label" htmlFor="dogVaccination">Дата последней прививки</label>
            <input
              id="dogVaccination"
              className="add-dog-modal-input"
              type="date"
              value={lastVaccinationDate}
              onChange={(e) => setLastVaccinationDate(e.target.value)}
            />
          </div>

          {/* Клуб */}
          <div className="add-dog-modal-field" ref={clubRef}>
            <label className="add-dog-modal-label">Клуб</label>
            <button
              ref={clubButtonRef}
              type="button"
              className={`add-dog-modal-select ${isClubOpen ? 'add-dog-modal-select--open' : ''}`}
              onClick={() => {
                setIsClubOpen(!isClubOpen);
                setIsBreedOpen(false);
              }}
            >
              {isClubOpen ? (
                <input
                  ref={clubInputRef}
                  className="add-dog-modal-search"
                  type="text"
                  placeholder="Поиск клуба..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="add-dog-modal-select-value">
                  {selectedClubName || 'Без клуба'}
                </span>
              )}
              <img className="add-dog-modal-select-arrow" src={arrowDown} alt="" />
            </button>
            {isClubOpen && (
              <ul className="add-dog-modal-dropdown" style={getDropdownStyle(clubButtonRef)}>
                <li
                  className={`add-dog-modal-option ${!clubId ? 'add-dog-modal-option--active' : ''}`}
                  onClick={() => {
                    setClubId('');
                    setIsClubOpen(false);
                    setClubSearch('');
                  }}
                >
                  Без клуба
                </li>
                {filteredClubs.map((club) => (
                  <li
                    key={club.id}
                    className={`add-dog-modal-option ${parseInt(clubId) === club.id ? 'add-dog-modal-option--active' : ''}`}
                    onClick={() => {
                      setClubId(String(club.id));
                      setIsClubOpen(false);
                      setClubSearch('');
                    }}
                  >
                    {club.name}
                  </li>
                ))}
                {filteredClubs.length === 0 && (
                  <li className="add-dog-modal-option add-dog-modal-option--empty">
                    Ничего не найдено
                  </li>
                )}
              </ul>
            )}
          </div>

          {error && <p className="add-dog-modal-error">{error}</p>}
          {success && <p className="add-dog-modal-success">{success}</p>}

          <button type="submit" className="add-dog-modal-submit">
            Зарегистрировать
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDogModal;