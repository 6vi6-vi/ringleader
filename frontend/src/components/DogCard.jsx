import dogPlaceholder from '../images/dog-placeholder.png';
import './DogCard.css';

const DogCard = ({ dog }) => {
  return (
    <div className="dog-card">
      <h3 className="dog-card-name">{dog.name}</h3>
      <div className="dog-card-body">
        <img
          className="dog-card-photo"
          src={dog.photo_url || dogPlaceholder}
          alt={dog.name}
        />
        <div className="dog-card-info">
          <p className="dog-card-row">
            <span className="dog-card-label">Порода: </span>
            <span className="dog-card-value">{dog.breed_name}</span>
          </p>
          <p className="dog-card-row">
            <span className="dog-card-label">Владелец: </span>
            <span className="dog-card-value">{dog.owner_name}</span>
          </p>
          <p className="dog-card-row">
            <span className="dog-card-label">Клуб: </span>
            <span className="dog-card-value">
              {dog.club_name ? `«${dog.club_name}»` : 'Без клуба'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DogCard;