import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import './RequestsPage.css';

const RequestsPage = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isAdmin = role === 'Admin';
  const navigate = useNavigate();

  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(isAdmin ? 'incoming' : 'my');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      if (isAuthenticated) {
        const myRes = await client.get('/participation/my');
        setMyRequests(myRes.data);
      }
      if (isAdmin) {
        const allRes = await client.get('/participation/all');
        setAllRequests(allRes.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await client.post(`/participation/${id}/approve`);
      fetchData();
    } catch (err) {
      alert('Ошибка при одобрении');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Укажите причину отклонения (необязательно):');
    if (reason === null) return; // нажата отмена
    try {
      await client.post(`/participation/${id}/reject`, { reason: reason || '' });
      fetchData();
    } catch (err) {
      alert('Ошибка при отклонении');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="requests-badge requests-badge--approved">Одобрена</span>;
      case 'Rejected': return <span className="requests-badge requests-badge--rejected">Отклонена</span>;
      default: return <span className="requests-badge requests-badge--pending">На рассмотрении</span>;
    }
  };

  if (loading) return <div className="requests-page"><p className="requests-loading">Загрузка...</p></div>;

  return (
    <div className="requests-page">
      <section className="requests-hero">
        <img className="requests-hero-paws requests-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="requests-hero-paws requests-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="requests-hero-title">ЗАЯВКИ</h1>
      </section>

      {isAdmin && (
        <div className="requests-tabs">
          <button className={`requests-tab ${tab === 'incoming' ? 'requests-tab--active' : ''}`} onClick={() => setTab('incoming')}>
            Входящие ({allRequests.filter((r) => r.status === 'Pending').length})
          </button>
          <button className={`requests-tab ${tab === 'my' ? 'requests-tab--active' : ''}`} onClick={() => setTab('my')}>
            Мои ({myRequests.length})
          </button>
          <button className={`requests-tab ${tab === 'processed' ? 'requests-tab--active' : ''}`} onClick={() => setTab('processed')}>
            Обработанные ({allRequests.filter((r) => r.status !== 'Pending').length})
          </button>
        </div>
      )}

      {tab === 'incoming' && isAdmin && (
        <div className="requests-grid">
          {allRequests.filter((r) => r.status === 'Pending').length > 0 ? (
            allRequests.filter((r) => r.status === 'Pending').map((r) => (
              <div key={r.id} className="request-card">
                <div className="request-card-header">
                  <h3 className="request-card-name">{r.dog_name}</h3>
                  <span className="requests-badge requests-badge--pending">На рассмотрении</span>
                </div>
                <div className="request-card-info">
                  <p className="request-card-row">
                    <span className="request-card-label">Порода: </span>
                    <span className="request-card-value">{r.breed_name}</span>
                  </p>
                  <p className="request-card-row">
                    <span className="request-card-label">Выставка: </span>
                    <span className="request-card-value">{r.exhibition_name} ({new Date(r.exhibition_date).toLocaleDateString('ru-RU')})</span>
                  </p>
                  <p className="request-card-row">
                    <span className="request-card-label">Владелец: </span>
                    <span className="request-card-value">{r.owner_name}</span>
                  </p>
                </div>
                <div className="request-card-actions">
                  <button className="requests-approve-btn" onClick={() => handleApprove(r.id)}>Одобрить</button>
                  <button className="requests-reject-btn" onClick={() => handleReject(r.id)}>Отклонить</button>
                </div>
              </div>
            ))
          ) : (
            <p className="requests-empty">Нет новых заявок</p>
          )}
        </div>
      )}

      {tab === 'processed' && isAdmin && (
        <div className="requests-grid">
          {allRequests.filter((r) => r.status !== 'Pending').length > 0 ? (
            allRequests.filter((r) => r.status !== 'Pending').map((r) => (
              <div key={r.id} className="request-card">
                <div className="request-card-header">
                  <h3 className="request-card-name">{r.dog_name}</h3>
                  {getStatusBadge(r.status)}
                </div>
                <div className="request-card-info">
                  <p className="request-card-row">
                    <span className="request-card-label">Порода: </span>
                    <span className="request-card-value">{r.breed_name}</span>
                  </p>
                  <p className="request-card-row">
                    <span className="request-card-label">Выставка: </span>
                    <span className="request-card-value">{r.exhibition_name}</span>
                  </p>
                  <p className="request-card-row">
                    <span className="request-card-label">Владелец: </span>
                    <span className="request-card-value">{r.owner_name}</span>
                  </p>
                  {r.reject_reason && (
                    <p className="request-card-row">
                      <span className="request-card-label">Причина отказа: </span>
                      <span className="request-card-value">{r.reject_reason}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="requests-empty">Нет обработанных заявок</p>
          )}
        </div>
      )}

      {tab === 'my' && (
        <div className="requests-grid">
          {myRequests.length > 0 ? (
            myRequests.map((r) => (
              <div key={r.id} className="request-card">
                <div className="request-card-header">
                  <h3 className="request-card-name">{r.dog_name}</h3>
                  {getStatusBadge(r.status)}
                </div>
                <div className="request-card-info">
                  <p className="request-card-row">
                    <span className="request-card-label">Выставка: </span>
                    <span className="request-card-value">{r.exhibition_name} ({new Date(r.exhibition_date).toLocaleDateString('ru-RU')})</span>
                  </p>
                  {r.reject_reason && (
                    <p className="request-card-row">
                      <span className="request-card-label">Причина отказа: </span>
                      <span className="request-card-value">{r.reject_reason}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="requests-empty">У вас пока нет заявок</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;