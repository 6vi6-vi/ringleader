import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import clubPlaceholder from '../images/club-placeholder.png';
import './CreateClubPage.css';

const CreateClubPage = () => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chairmanName, setChairmanName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (!isAuthenticated || role !== 'Admin') {
      navigate('/');
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Введите название клуба');
      return;
    }

    if (!chairmanName.trim()) {
      setError('Введите ФИО председателя');
      return;
    }

    try {
      const res = await client.post('/clubs', {
        name: name.trim(),
        city: city.trim(),
        description: description.trim() || null,
        chairman_name: chairmanName.trim(),
      });

      if (logo) {
        const formData = new FormData();
        formData.append('file', logo);
        await client.post(`/clubs/${res.data.id}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess('Клуб создан!');
      setTimeout(() => navigate('/clubs'), 500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Клуб с таким названием уже существует');
      } else {
        setError(err.response?.data?.detail || 'Ошибка при создании клуба');
      }
    }
  };

  return (
    <div className="create-club-page">
      <section className="create-club-hero">
        <img className="create-club-hero-paws create-club-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="create-club-hero-paws create-club-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="create-club-hero-title">ДОБАВЛЕНИЕ КЛУБА</h1>
      </section>

      <form className="create-club-form" onSubmit={handleSubmit}>
        <div className="create-club-columns">
          {/* Левая колонка — логотип */}
          <div className="create-club-photo-section">
            <img
              className="create-club-photo"
              src={logoPreview || clubPlaceholder}
              alt="Логотип"
            />
            <label className="create-club-photo-button">
              Загрузить логотип
              <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
            </label>
          </div>

          {/* Правая колонка — поля */}
          <div className="create-club-fields">
            <div className="create-club-field">
              <label className="create-club-label" htmlFor="clubName">Название</label>
              <input
                id="clubName"
                className="create-club-input"
                type="text"
                placeholder="Введите название клуба"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="create-club-field">
              <label className="create-club-label" htmlFor="clubCity">Город</label>
              <input
                id="clubCity"
                className="create-club-input"
                type="text"
                placeholder="Введите город"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="create-club-field">
              <label className="create-club-label" htmlFor="clubChairman">Председатель</label>
              <input
                id="clubChairman"
                className="create-club-input"
                type="text"
                placeholder="Введите ФИО председателя"
                value={chairmanName}
                onChange={(e) => setChairmanName(e.target.value)}
                required
              />
            </div>

            <div className="create-club-field create-club-field--full">
              <label className="create-club-label" htmlFor="clubDescription">Описание</label>
              <textarea
                id="clubDescription"
                className="create-club-input create-club-textarea"
                placeholder="Введите описание клуба (необязательно)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        {error && <p className="create-club-error">{error}</p>}
        {success && <p className="create-club-success">{success}</p>}

        <div className="create-club-buttons">
          <button type="button" className="create-club-cancel" onClick={() => navigate('/clubs')}>Отмена</button>
          <button type="submit" className="create-club-submit">Создать</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClubPage;