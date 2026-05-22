import avatarPlaceholder from '../images/avatar.jpg';
import './ExpertCard.css';

const ExpertCard = ({ expert }) => {
  return (
    <div className="expert-card">
      <img
        className="expert-card-photo"
        src={expert.photo || avatarPlaceholder}
        alt={expert.full_name}
      />
      <h3 className="expert-card-name">{expert.full_name}</h3>
      <div className="expert-card-info">
        <p className="expert-card-row">
          <span className="expert-card-label">Специализация: </span>
          <span className="expert-card-value">{expert.specialization}</span>
        </p>
        <p className="expert-card-row">
          <span className="expert-card-label">Клуб: </span>
          <span className="expert-card-value">
            {expert.club_name ? `«${expert.club_name}»` : 'Без клуба'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ExpertCard;