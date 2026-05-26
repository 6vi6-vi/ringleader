import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

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
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          Выход
        </button>
      </div>
    </>
  );
};

export default UserMenu;