import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import './UserMenu.css';

const UserMenu = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (err) {
    }
    onClose();
    onLogout();
  };

  return (
    <>
      <div className="user-menu-overlay" onClick={onClose} />
      <div className="user-menu">
        <button
          className="user-menu-item"
          onClick={() => {
            onClose();
            navigate('/profile');
          }}
        >
          Личный кабинет
        </button>
        <button
          className="user-menu-item user-menu-item--logout"
          onClick={handleLogout}
        >
          Выход
        </button>
      </div>
    </>
  );
};

export default UserMenu;