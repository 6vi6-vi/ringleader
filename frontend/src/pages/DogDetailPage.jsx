import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import './DogDetailPage.css';

const DogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const [dog, setDog] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser && dog && currentUser.id === dog.owner_id;
  const isAdmin = role === 'Admin';
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dogRes, userRes, exhibitionsRes] = await Promise.all([
          client.get(`/dogs/${id}`),
          isAuthenticated ? client.get('/auth/me') : Promise.resolve(null),
          client.get(`/dogs/${id}/exhibitions`).catch(() => ({ data: [] })),
        ]);
        setDog(dogRes.data);
        if (userRes) setCurrentUser(userRes.data);
        setExhibitions(exhibitionsRes.data || []);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Не указано';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getAgeSuffix = (age) => {
    if (!age && age !== 0) return '';
    const last = age % 10;
    const lastTwo = age % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return 'лет';
    if (last === 1) return 'год';
    if (last >= 2 && last <= 4) return 'года';
    return 'лет';
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить профиль собаки? Это действие нельзя отменить.')) {
        return;
    }
    setIsDeleting(true);
    try {
        await client.delete(`/dogs/${id}`);
        navigate('/dogs');
    } catch (err) {
        if (err.response?.status === 409) {
        alert('Нельзя удалить собаку, которая участвовала в выставках');
        } else {
        alert('Не удалось удалить собаку');
        }
    } finally {
        setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="dog-detail-page">
        <p className="dog-detail-loading">Загрузка...</p>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="dog-detail-page">
        <p className="dog-detail-loading">Собака не найдена</p>
      </div>
    );
  }

  return (
    <div className="dog-detail-page">
      {/* ── Герой ── */}
      <section className="dog-detail-hero">
        <img className="dog-detail-hero-paws dog-detail-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="dog-detail-hero-paws dog-detail-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="dog-detail-hero-title">ПРОФИЛЬ СОБАКИ</h1>
      </section>

      {/* ── Информация о собаке ── */}
      <section className="dog-detail-section">
        <div className="dog-detail-section-header">
          <h2 className="dog-detail-section-title">ОСНОВНАЯ ИНФОРМАЦИЯ</h2>
          {canEdit && (
            <div className="dog-detail-actions">
              <button
                className="dog-detail-edit-btn"
                onClick={() => navigate(`/dogs/${id}/edit`)}
              >
                Редактировать
              </button>
              {canDelete && (
                <button
                  className="dog-detail-delete-btn"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="dog-detail-card">
          <div className="dog-detail-photo-section">
            <img
              className="dog-detail-photo"
              src={dog.photo_url || dogPlaceholder}
              alt={dog.name}
            />
          </div>
          <div className="dog-detail-info">
            <div className="dog-detail-row">
              <span className="dog-detail-label">Кличка:</span>
              <span className="dog-detail-value">{dog.name}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Порода:</span>
              <span className="dog-detail-value">{dog.breed_name}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Возраст:</span>
              <span className="dog-detail-value">{dog.age} {getAgeSuffix(dog.age)}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Номер родословной:</span>
              <span className="dog-detail-value">{dog.pedigree_number || 'Не указан'}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Отец:</span>
              <span className="dog-detail-value">{dog.father_name || 'Не указан'}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Мать:</span>
              <span className="dog-detail-value">{dog.mother_name || 'Не указана'}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Дата последней прививки:</span>
              <span className="dog-detail-value">{formatDate(dog.last_vaccination_date)}</span>
            </div>
            <div className="dog-detail-row">
              <span className="dog-detail-label">Клуб:</span>
              <span className="dog-detail-value">{dog.club_name ? `«${dog.club_name}»` : 'Без клуба'}</span>
            </div>
            <div className="dog-detail-row dog-detail-row--full">
              <span className="dog-detail-label">Владелец:</span>
              <span className="dog-detail-value">{dog.owner_name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Участие в выставках ── */}
      <section className="dog-detail-section">
        <h2 className="dog-detail-section-title">ВЫСТАВКИ</h2>
        {exhibitions.length > 0 ? (
          <div className="dog-detail-exhibitions">
            {exhibitions.map((ex) => (
              <div key={ex.id} className="dog-detail-exhibition-card" onClick={() => navigate(`/exhibitions/${ex.id}`)}>
                <div className="dog-detail-exhibition-info">
                  <h3 className="dog-detail-exhibition-name">{ex.name}</h3>
                  <p className="dog-detail-exhibition-meta">
                    {formatDate(ex.date)} — {ex.address}
                  </p>
                </div>
                {ex.place && (
                  <span className={`dog-detail-medal dog-detail-medal--place-${ex.place}`}>
                    {ex.place === 1 ? '1 место' : ex.place === 2 ? '2 место' : '3 место'}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="dog-detail-empty">Собака пока не участвовала в выставках.</p>
        )}
      </section>
    </div>
  );
};

export default DogDetailPage;