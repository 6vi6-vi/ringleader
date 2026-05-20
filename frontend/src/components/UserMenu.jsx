import './UserMenu.css';

const UserMenu = ({ isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="user-menu-overlay" onClick={onClose} />
      <div className="user-menu">
        <button
          className="user-menu-item"
          onClick={() => {
            onClose();
            // Здесь будет переход в личный кабинет
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