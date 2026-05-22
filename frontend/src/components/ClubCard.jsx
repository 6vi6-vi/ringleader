import clubPlaceholder from '../images/avatar.jpg';
import './ClubCard.css';

const ClubCard = ({ club }) => {
  return (
    <div className="club-card">
      <img
        className="club-card-photo"
        src={club.photo || clubPlaceholder}
        alt={club.name}
      />
      <h3 className="club-card-name">{club.name}</h3>
      <div className="club-card-info">
        <p className="club-card-row">
          <span className="club-card-label">Описание: </span>
          <span className="club-card-value">{club.description || 'Нет описания'}</span>
        </p>
        <p className="club-card-row">
          <span className="club-card-label">Председатель: </span>
          <span className="club-card-value">
            {club.chairman_name || 'Не назначен'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ClubCard;