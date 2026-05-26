import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import closeIcon from '../images/close.png';
import arrowDown from '../images/arrow-down.png';
import './ApplyExhibitionModal.css';

const ApplyExhibitionModal = ({ isOpen, onClose, exhibition }) => {
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDogId('');
      setIsSelectOpen(false);
      setError('');
      setSuccess('');
      fetchMyDogs();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMyDogs = async () => {
    try {
      const res = await client.get('/dogs');
      const meRes = await client.get('/auth/me');
      const myDogs = res.data.filter((d) => d.owner_id === meRes.data.id);
      setDogs(myDogs);
    } catch (err) {
      console.error('Ошибка загрузки собак:', err);
    }
  };

  if (!isOpen) return null;

  const selectedDog = dogs.find((d) => d.id === parseInt(selectedDogId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDogId) {
      setError('Выберите собаку');
      return;
    }

    try {
      await client.post('/participation', {
        dog_id: parseInt(selectedDogId),
        exhibition_id: exhibition.id,
      });
      setSuccess('Заявка успешно отправлена!');
      setTimeout(() => onClose(), 500);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Вы уже подали заявку с этой собакой на эту выставку');
      } else {
        setError(err.response?.data?.detail || 'Ошибка при отправке заявки');
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="apply-modal-overlay" onClick={handleOverlayClick}>
      <div className="apply-modal">
        <div className="apply-modal-header">
          <h2 className="apply-modal-title">Подать заявку</h2>
          <button className="apply-modal-close" onClick={onClose}>
            <img src={closeIcon} alt="Закрыть" />
          </button>
        </div>

        <form className="apply-modal-form" onSubmit={handleSubmit}>
          <p className="apply-modal-exhibition">
            <span className="apply-modal-exhibition-label">Выставка: </span>
            <span className="apply-modal-exhibition-name">{exhibition?.name}</span>
          </p>

          <div className="apply-modal-field" ref={selectRef}>
            <label className="apply-modal-label">Собака</label>
            {dogs.length > 0 ? (
              <>
                <button
                  type="button"
                  className={`apply-modal-select ${isSelectOpen ? 'apply-modal-select--open' : ''}`}
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  <span className={`apply-modal-select-value ${!selectedDogId ? 'apply-modal-select-placeholder' : ''}`}>
                    {selectedDog ? `${selectedDog.name} (${selectedDog.breed_name})` : 'Выберите собаку'}
                  </span>
                  <img className="apply-modal-select-arrow" src={arrowDown} alt="" />
                </button>
                {isSelectOpen && (
                  <ul className="apply-modal-dropdown">
                    {dogs.map((dog) => (
                      <li
                        key={dog.id}
                        className={`apply-modal-dropdown-option ${parseInt(selectedDogId) === dog.id ? 'apply-modal-dropdown-option--active' : ''}`}
                        onClick={() => { setSelectedDogId(String(dog.id)); setIsSelectOpen(false); }}
                      >
                        {dog.name} ({dog.breed_name})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="apply-modal-no-dogs">
                У вас нет зарегистрированных собак.{' '}
                <a href="/dogs/register">Добавить собаку</a>
              </p>
            )}
          </div>

          {error && <p className="apply-modal-error">{error}</p>}
          {success && <p className="apply-modal-success">{success}</p>}

          {dogs.length > 0 && (
            <button type="submit" className="apply-modal-submit">
              Отправить заявку
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyExhibitionModal;