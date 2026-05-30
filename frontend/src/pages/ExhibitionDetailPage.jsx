import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import './ExhibitionDetailPage.css';

const ExhibitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isAdmin = role === 'Admin';

  const [exhibition, setExhibition] = useState(null);
  const [exhibitionResults, setExhibitionResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', address: '', ringsCount: 1 });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    fetchExhibition();
  }, [id]);

  const fetchExhibition = async () => {
    try {
      const res = await client.get(`/exhibitions/${id}`);
      setExhibition(res.data);
      setForm({
        name: res.data.name,
        date: res.data.date,
        address: res.data.address || '',
        ringsCount: res.data.rings?.length || 1,
      });
      try {
        const resultsRes = await client.get(`/results/exhibition/${id}`);
        setExhibitionResults(resultsRes.data);
      } catch (err) {}
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!form.name.trim()) { setEditError('Введите название'); return; }
    if (!form.date) { setEditError('Выберите дату'); return; }
    if (!form.address.trim()) { setError('Введите адрес'); return; }
    if (form.ringsCount < 1 || form.ringsCount > 20) { setEditError('Количество рингов: от 1 до 20'); return; }
    try {
      await client.put(`/exhibitions/${id}`, {
        name: form.name.trim(),
        date: form.date,
        address: form.address.trim() || null,
      });
      const currentCount = exhibition.rings?.length || 0;
      if (form.ringsCount > currentCount) {
        for (let i = currentCount + 1; i <= form.ringsCount; i++) {
          await client.post(`/exhibitions/${id}/rings`, { number: `Ринг №${i}` });
        }
      } else if (form.ringsCount < currentCount) {
        const ringsToDelete = exhibition.rings.slice(form.ringsCount);
        for (const ring of ringsToDelete) {
          await client.delete(`/exhibitions/${id}/rings/${ring.id}`);
        }
      }
      setEditing(false);
      fetchExhibition();
    } catch (err) {
      setEditError('Ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить выставку?')) return;
    try {
      await client.delete(`/exhibitions/${id}`);
      navigate('/exhibitions');
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleRemoveParticipant = async (requestId) => {
    if (!window.confirm('Снять собаку с участия в выставке?')) return;
    try {
      await client.post(`/participation/${requestId}/remove`);
      fetchExhibition();
    } catch (err) {
      alert('Ошибка при снятии с участия');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const exDate = new Date(dateStr);
    const today = new Date();
    return (
      exDate.getFullYear() === today.getFullYear() &&
      exDate.getMonth() === today.getMonth() &&
      exDate.getDate() === today.getDate()
    );
  };

  if (loading) return <div className="exhibition-detail-page"><p className="exhibition-detail-loading">Загрузка...</p></div>;
  if (!exhibition) return <div className="exhibition-detail-page"><p className="exhibition-detail-loading">Выставка не найдена</p></div>;

  return (
    <div className="exhibition-detail-page">
      <section className="exhibition-detail-hero">
        <img className="exhibition-detail-hero-paws exhibition-detail-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="exhibition-detail-hero-paws exhibition-detail-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="exhibition-detail-hero-title">ПРОСМОТР ВЫСТАВКИ</h1>
      </section>

      <button className="exhibition-detail-back" onClick={() => navigate('/exhibitions')}>&larr; Назад</button>

      {/* ── Информация ── */}
      <section className="exhibition-detail-section">
        <div className="exhibition-detail-section-header">
          <h2 className="exhibition-detail-section-title">ИНФОРМАЦИЯ</h2>
          {isAdmin && !editing && (
            <div className="exhibition-detail-actions">
              <button className="exhibition-detail-edit-btn" onClick={() => setEditing(true)}>Редактировать</button>
              <button className="exhibition-detail-delete-btn" onClick={handleDelete}>Удалить</button>
            </div>
          )}
        </div>
        {editing ? (
          <form className="exhibition-detail-edit-form" onSubmit={handleUpdate}>
            <div className="exhibition-detail-field">
              <label className="exhibition-detail-label">Название</label>
              <input className="exhibition-detail-input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="exhibition-detail-field">
              <label className="exhibition-detail-label">Дата</label>
              <input className="exhibition-detail-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="exhibition-detail-field">
              <label className="exhibition-detail-label">Адрес</label>
              <input className="exhibition-detail-input" type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="exhibition-detail-field">
              <label className="exhibition-detail-label">Количество рингов</label>
              <input
                className="exhibition-detail-input"
                type="number" min="1" max="20"
                value={form.ringsCount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setForm({ ...form, ringsCount: '' });
                  else { const num = parseInt(val); if (!isNaN(num)) setForm({ ...form, ringsCount: num }); }
                }}
                required
              />
            </div>
            {editError && <p className="exhibition-detail-error">{editError}</p>}
            {editSuccess && <p className="exhibition-detail-success">{editSuccess}</p>}
            <div className="exhibition-detail-buttons">
              <button type="button" className="exhibition-detail-cancel-btn" onClick={() => setEditing(false)}>Отмена</button>
              <button type="submit" className="exhibition-detail-save-btn">Сохранить</button>
            </div>
          </form>
        ) : (
          <div className="exhibition-detail-info">
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Название:</span>
              <span className="exhibition-detail-info-value">{exhibition.name}</span>
            </div>
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Дата:</span>
              <span className="exhibition-detail-info-value">{formatDate(exhibition.date)}</span>
            </div>
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Адрес:</span>
              <span className="exhibition-detail-info-value">{exhibition.address || 'Не указан'}</span>
            </div>
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Организатор:</span>
              <span className="exhibition-detail-info-value">{exhibition.organizer_name}</span>
            </div>
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Рингов:</span>
              <span className="exhibition-detail-info-value">{exhibition.rings?.length || 0}</span>
            </div>
            <div className="exhibition-detail-row">
              <span className="exhibition-detail-info-label">Участников:</span>
              <span className="exhibition-detail-info-value">{exhibition.participants_count}</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Участники ── */}
      <section className="exhibition-detail-section">
        <div className="exhibition-detail-section-header">
          <h2 className="exhibition-detail-section-title">УЧАСТНИКИ ({exhibition.participants?.length || 0})</h2>
          {isAdmin && exhibition.participants?.length > 0 && isToday(exhibition.date) && (
            <button className="exhibition-detail-edit-btn" onClick={() => navigate(`/exhibitions/${id}/fix-results`)}>
              Зафиксировать результаты
            </button>
          )}
        </div>
        {exhibition.participants?.length > 0 ? (
          <div className="exhibition-detail-participants">
            {exhibition.participants.map((p) => (
              <div
                key={p.id}
                className="exhibition-participant-card"
                onClick={() => navigate(`/dogs/${p.dog_id}`)}
              >
                {isAdmin && isToday(exhibition.date) && (
                  <button
                    className="exhibition-participant-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveParticipant(p.id);
                    }}
                    title="Снять с участия"
                  >
                    &times;
                  </button>
                )}
                <img
                  className="exhibition-participant-photo"
                  src={p.dog_photo_url || dogPlaceholder}
                  alt={p.dog_name}
                />
                <span className="exhibition-participant-name">{p.dog_name}</span>
                <span className="exhibition-participant-breed">{p.breed_name}</span>
                <span className="exhibition-participant-owner">{p.owner_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="exhibition-detail-empty">Пока нет одобренных участников</p>
        )}
      </section>

      {/* ── Результаты ── */}
      {exhibitionResults.filter((r) => r.place).length > 0 && (
        <section className="exhibition-detail-section">
          <h2 className="exhibition-detail-section-title">РЕЗУЛЬТАТЫ</h2>
          <div className="exhibition-results-breeds">
            {Object.entries(
              exhibitionResults
                .filter((r) => r.place)
                .reduce((acc, r) => {
                  const breed = r.breed_name || 'Без породы';
                  if (!acc[breed]) acc[breed] = [];
                  acc[breed].push(r);
                  return acc;
                }, {})
            ).map(([breed, results]) => (
              <div key={breed} className="exhibition-results-breed-group">
                <h3 className="exhibition-results-breed-title">{breed}</h3>
                <div className="exhibition-results-cards">
                  {results
                    .sort((a, b) => a.place - b.place)
                    .map((r) => (
                      <div key={r.id} className="exhibition-results-card-wrapper">
                        <span className={`exhibition-results-medal exhibition-results-medal--place-${r.place}`}>
                          {r.place} место
                        </span>
                        <div className="exhibition-participant-card" onClick={() => navigate(`/dogs/${r.dog_id}`)}>
                          <img
                            className="exhibition-participant-photo"
                            src={r.dog_photo_url || dogPlaceholder}
                            alt={r.dog_name}
                          />
                          <span className="exhibition-participant-name">{r.dog_name}</span>
                          <span className="exhibition-participant-owner">{r.owner_name}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ExhibitionDetailPage;