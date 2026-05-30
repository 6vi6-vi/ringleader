import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import clubPlaceholder from '../images/club-placeholder.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import './ClubDetailPage.css';

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdmin = role === 'Admin';

  const [club, setClub] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', chairman_name: '', description: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [clubRes, dogsRes] = await Promise.all([
        client.get('/clubs'),
        client.get('/dogs'),
      ]);
      const clubData = clubRes.data.find((c) => c.id === parseInt(id));
      setClub(clubData);
      setForm({
        name: clubData.name,
        city: clubData.city || '',
        chairman_name: clubData.chairman_name || '',
        description: clubData.description || '',
      });
      const clubDogs = dogsRes.data.filter((d) => d.club_id === parseInt(id));
      setDogs(clubDogs);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (!form.name.trim()) { setEditError('Введите название клуба'); return; }

    try {
      await client.put(`/clubs/${id}`, {
        name: form.name.trim(),
        city: form.city.trim() || null,
        chairman_name: form.chairman_name.trim() || null,
        description: form.description.trim() || null,
      });

      if (logo) {
        const formData = new FormData();
        formData.append('file', logo);
        await client.post(`/clubs/${id}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setEditSuccess('Изменения сохранены');
      setEditing(false);
      setLogo(null);
      setLogoPreview(null);
      fetchData();
    } catch (err) {
      setEditError('Ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить клуб? Это действие нельзя отменить.')) return;
    setIsDeleting(true);
    try {
      await client.delete(`/clubs/${id}`);
      navigate('/clubs');
    } catch (err) {
      alert('Ошибка при удалении клуба');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="club-detail-page"><p className="club-detail-loading">Загрузка...</p></div>;
  if (!club) return <div className="club-detail-page"><p className="club-detail-loading">Клуб не найден</p></div>;

  return (
    <div className="club-detail-page">
      <section className="club-detail-hero">
        <img className="club-detail-hero-paws club-detail-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="club-detail-hero-paws club-detail-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="club-detail-hero-title">ПРОФИЛЬ КЛУБА</h1>
      </section>

      <button className="club-detail-back" onClick={() => navigate('/clubs')}>&larr; Назад</button>

      {/* ── Информация ── */}
      <section className="club-detail-section">
        <div className="club-detail-section-header">
          <h2 className="club-detail-section-title">ИНФОРМАЦИЯ</h2>
          {isAdmin && !editing && (
            <div className="club-detail-actions">
              <button className="club-detail-edit-btn" onClick={() => setEditing(true)}>
                Редактировать
              </button>
              <button className="club-detail-delete-btn" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form className="club-detail-edit-form" onSubmit={handleUpdate}>
            <div className="club-detail-card">
                <div className="club-detail-photo-section">
                    <img
                        className="club-detail-photo"
                        src={logoPreview || club.logo_url || clubPlaceholder}
                        alt="Логотип"
                    />
                    <label className="club-detail-logo-button">
                        Изменить логотип
                        <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                    </label>
                </div>
                <div className="club-detail-edit-fields">
                    <div className="club-detail-edit-field">
                    <label className="club-detail-edit-label">Название</label>
                    <input
                        className="club-detail-edit-input"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    </div>
                    <div className="club-detail-edit-field">
                    <label className="club-detail-edit-label">Город</label>
                    <input
                        className="club-detail-edit-input"
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    </div>
                    <div className="club-detail-edit-field">
                    <label className="club-detail-edit-label">Председатель</label>
                    <input
                        className="club-detail-edit-input"
                        type="text"
                        value={form.chairman_name}
                        onChange={(e) => setForm({ ...form, chairman_name: e.target.value })}
                    />
                    </div>
                    <div className="club-detail-edit-field club-detail-edit-field--full">
                    <label className="club-detail-edit-label">Описание</label>
                    <textarea
                        className="club-detail-edit-input club-detail-edit-textarea"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                    />
                    </div>
                </div>
            </div>
            {editError && <p className="club-detail-error">{editError}</p>}
            {editSuccess && <p className="club-detail-success">{editSuccess}</p>}
            <div className="club-detail-edit-buttons">
            <button type="button" className="club-detail-cancel-btn" onClick={() => setEditing(false)}>Отмена</button>
            <button type="submit" className="club-detail-save-btn">Сохранить</button>
            </div>
        </form>
        ) : (
          <div className="club-detail-card">
            <div className="club-detail-photo-section">
              <img
                className="club-detail-photo"
                src={club.logo_url || clubPlaceholder}
                alt={club.name}
              />
            </div>
            <div className="club-detail-info">
              <div className="club-detail-row">
                <span className="club-detail-label">Название:</span>
                <span className="club-detail-value">{club.name}</span>
              </div>
              <div className="club-detail-row">
                <span className="club-detail-label">Город:</span>
                <span className="club-detail-value">{club.city || 'Не указан'}</span>
              </div>
              <div className="club-detail-row">
                <span className="club-detail-label">Председатель:</span>
                <span className="club-detail-value">{club.chairman_name || 'Не назначен'}</span>
              </div>
              <div className="club-detail-row">
                <span className="club-detail-label">Собак в клубе:</span>
                <span className="club-detail-value">{dogs.length}</span>
              </div>
              <div className="club-detail-row club-detail-row--full">
                <span className="club-detail-label">Описание:</span>
                <span className="club-detail-value">{club.description || 'Нет описания'}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Собаки клуба ── */}
      <section className="club-detail-section">
        <h2 className="club-detail-section-title">СОБАКИ КЛУБА</h2>
        {dogs.length > 0 ? (
          <div className="club-detail-dogs">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="club-detail-dog-card"
                onClick={() => navigate(`/dogs/${dog.id}`)}
              >
                <img
                  className="club-detail-dog-photo"
                  src={dog.photo_url || dogPlaceholder}
                  alt={dog.name}
                />
                <span className="club-detail-dog-name">{dog.name}</span>
                <span className="club-detail-dog-breed">{dog.breed_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="club-detail-empty">В этом клубе пока не состоит ни одной собаки.</p>
        )}
      </section>
    </div>
  );
};

export default ClubDetailPage;