import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useAuthStore from '../store/authStore';
import pawsPatternLeft from '../images/left.png';
import pawsPatternRight from '../images/right.png';
import avatarPlaceholder from '../images/avatar.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import './ProfilePage.css';

const ProfilePage = () => {
  const { isAuthenticated, login: authLogin, setAvatar } = useAuthStore();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPassport, setEditPassport] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, dogsRes] = await Promise.all([
          client.get('/auth/me'),
          client.get('/dogs'),
        ]);
        setUser(userRes.data);
        setEditFullName(userRes.data.full_name);
        setEditPassport(userRes.data.passport);
        setAvatarUrl(userRes.data.avatar_url);
        const myDogs = dogsRes.data.filter((d) => d.owner_id === userRes.data.id);
        setDogs(myDogs);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (!editFullName.trim() || editFullName.trim().length < 2) {
      setEditError('ФИО должно содержать не менее 2 символов');
      return;
    }
    if (!editPassport.trim() || editPassport.trim().length < 5) {
      setEditError('Паспортные данные должны содержать не менее 5 символов');
      return;
    }

    try {
      await client.put(`/users/${user.id}`, {
        full_name: editFullName.trim(),
        passport: editPassport.trim(),
      });
      setUser({ ...user, full_name: editFullName.trim(), passport: editPassport.trim() });

      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const res = await client.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newAvatarUrl = res.data.avatar_url;
        setAvatarUrl(newAvatarUrl);
        setAvatar(newAvatarUrl);
        setAvatarFile(null);
        setAvatarPreview(null);
      }

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      authLogin(token, role, editFullName.trim(), newAvatarUrl);

      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Ошибка при обновлении данных');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditFullName(user?.full_name || '');
    setEditPassport(user?.passport || '');
    setEditError('');
    setEditSuccess('');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-loading">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <img className="profile-hero-paws profile-hero-paws--left" src={pawsPatternLeft} alt="" />
        <img className="profile-hero-paws profile-hero-paws--right" src={pawsPatternRight} alt="" />
        <h1 className="profile-hero-title">ЛИЧНЫЙ КАБИНЕТ</h1>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">МОИ ДАННЫЕ</h2>
          {!editing && (
            <button className="profile-edit-btn" onClick={() => setEditing(true)}>
              Редактировать
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <img
              className="profile-avatar"
              src={avatarPreview || avatarUrl || avatarPlaceholder}
              alt="Аватар"
            />
            {editing && (
              <>
                <button
                  className="profile-avatar-button"
                  onClick={() => fileInputRef.current.click()}
                >
                  Изменить фото
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </>
            )}
          </div>

          <div className="profile-details">
            {editing ? (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="editFullName">ФИО</label>
                  <input
                    id="editFullName"
                    className="profile-input"
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="editPassport">Паспортные данные</label>
                  <input
                    id="editPassport"
                    className="profile-input"
                    type="text"
                    value={editPassport}
                    onChange={(e) => setEditPassport(e.target.value)}
                    required
                  />
                </div>
                {editError && <p className="profile-error">{editError}</p>}
                {editSuccess && <p className="profile-success">{editSuccess}</p>}
                <div className="profile-buttons">
                  <button type="button" className="profile-cancel-btn" onClick={handleCancelEdit}>Отмена</button>
                  <button type="submit" className="profile-save-btn">Сохранить</button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-info-row">
                  <span className="profile-info-label">Логин:</span>
                  <span className="profile-info-value">{user?.login}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">ФИО:</span>
                  <span className="profile-info-value">{user?.full_name}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Паспортные данные:</span>
                  <span className="profile-info-value">{user?.passport}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">МОИ СОБАКИ</h2>
          <button
            className="profile-add-dog-btn"
            onClick={() => navigate('/dogs/register', { state: { from: '/profile' } })}
          >
            Добавить собаку
          </button>
        </div>
        {dogs.length > 0 ? (
          <div className="profile-dogs-grid">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="profile-dog-card"
                onClick={() => navigate(`/dogs/${dog.id}`)}
              >
                <img
                  className="profile-dog-photo"
                  src={dog.photo_url || dogPlaceholder}
                  alt={dog.name}
                />
                <span className="profile-dog-name">{dog.name}</span>
                <span className="profile-dog-breed">{dog.breed_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty">У вас пока нет зарегистрированных собак</p>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;