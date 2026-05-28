import clubPlaceholder from '../images/club-placeholder.png';
import './ClubCard.css';

const ClubCard = ({ club }) => {
  return (
    <div className="club-card">
      <h3 className="club-card-name">{club.name}</h3>
      <div className="club-card-body">
        <img
          className="club-card-photo"
          src={club.logo_url || clubPlaceholder}
          alt={club.name}
        />
        <div className="club-card-info">
          <p className="club-card-row">
            <span className="club-card-label">Город: </span>
            <span className="club-card-value">{club.city || 'Не указан'}</span>
          </p>
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
    </div>
  );
};

export default ClubCard;