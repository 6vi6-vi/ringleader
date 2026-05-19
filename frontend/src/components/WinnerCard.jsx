import './WinnerCard.css';

const WinnerCard = ({ place, name, owner, photo }) => {
  return (
    <div className="winner-card">
      <div className={`winner-card-medal winner-card-medal--place-${place}`}>
        {place} МЕСТО
      </div>
      <img
        className="winner-card-photo"
        src={photo}
        alt={name}
      />
      <h4 className="winner-card-name">{name}</h4>
      <p className="winner-card-owner">
        <span className="winner-card-owner-label">Владелец: </span>
        <span className="winner-card-owner-name">{owner}</span>
      </p>
    </div>
  );
};

export default WinnerCard;