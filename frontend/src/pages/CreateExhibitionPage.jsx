import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import './CreateExhibitionPage.css';

const CreateExhibitionPage = () => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [ringsCount, setRingsCount] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || role !== 'Admin') {
      navigate('/');
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Введите название выставки'); return; }
    if (!date) { setError('Выберите дату'); return; }

    // Проверка на прошедшую дату
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Нельзя создать выставку на прошедшую дату');
      return;
    }

    if (ringsCount < 1 || ringsCount > 20) { setError('Количество рингов: от 1 до 20'); return; }

    try {
      const res = await client.post('/exhibitions', {
        name: name.trim(),
        date,
        address: address.trim() || null,
      });

      const exhibitionId = res.data.id;

      for (let i = 1; i <= ringsCount; i++) {
        await client.post(`/exhibitions/${exhibitionId}/rings`, {
          number: `Ринг №${i}`,
        });
      }

      setSuccess('Выставка создана!');
      setTimeout(() => navigate('/exhibitions'), 800);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании выставки');
    }
  };

  return (
    <div className="create-exhibition-page">
      <section className="create-exhibition-hero">
        <img className="create-exhibition-hero-paws create-exhibition-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="create-exhibition-hero-paws create-exhibition-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="create-exhibition-hero-title">ДОБАВЛЕНИЕ ВЫСТАВКИ</h1>
      </section>

      <form className="create-exhibition-form" onSubmit={handleSubmit}>
        <div className="create-exhibition-fields">
          <div className="create-exhibition-field">
            <label className="create-exhibition-label" htmlFor="exName">Название</label>
            <input id="exName" className="create-exhibition-input" type="text" placeholder="Введите название выставки" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="create-exhibition-field">
            <label className="create-exhibition-label" htmlFor="exDate">Дата</label>
            <input id="exDate" className="create-exhibition-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="create-exhibition-field">
            <label className="create-exhibition-label" htmlFor="exAddress">Адрес</label>
            <input id="exAddress" className="create-exhibition-input" type="text" placeholder="Введите адрес (необязательно)" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="create-exhibition-field">
            <label className="create-exhibition-label" htmlFor="exRings">Количество рингов</label>
            <input
              id="exRings"
              className="create-exhibition-input"
              type="number"
              min="1"
              max="20"
              value={ringsCount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setRingsCount('');
                } else {
                  const num = parseInt(val);
                  if (!isNaN(num)) setRingsCount(num);
                }
              }}
              required
            />
          </div>
        </div>

        {error && <p className="create-exhibition-error">{error}</p>}
        {success && <p className="create-exhibition-success">{success}</p>}

        <div className="create-exhibition-buttons">
          <button type="button" className="create-exhibition-cancel" onClick={() => navigate('/exhibitions')}>Отмена</button>
          <button type="submit" className="create-exhibition-submit">Создать</button>
        </div>
      </form>
    </div>
  );
};

export default CreateExhibitionPage;