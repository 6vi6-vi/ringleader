import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeft from '../images/arrow-left.png';
import arrowRight from '../images/arrow-right.png';
import dogPlaceholder from '../images/dog-placeholder.png';
import './WinnersCarousel.css';

const WinnersCarousel = ({ breedsData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  if (!breedsData || breedsData.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? breedsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === breedsData.length - 1 ? 0 : prev + 1));
  };

  const currentBreed = breedsData[currentIndex];

  return (
    <div className="winners-carousel">
      {breedsData.length > 1 && (
        <button
          className="winners-carousel-arrow winners-carousel-arrow--left"
          onClick={handlePrev}
        >
          <img src={arrowLeft} alt="Назад" />
        </button>
      )}

      <div className="winners-carousel-content">
        <h3 className="winners-carousel-breed">{currentBreed.breedName}</h3>

        <div className="winners-carousel-cards">
          {currentBreed.winners
            .sort((a, b) => a.place - b.place)
            .map((winner) => (
              <div
                key={winner.id}
                className="winners-carousel-card-wrapper"
                onClick={() => navigate(`/dogs/${winner.dog_id}`)}
              >
                <span className={`winners-carousel-medal winners-carousel-medal--place-${winner.place}`}>
                  {winner.place} место
                </span>
                <div className="winners-carousel-card">
                  <img
                    className="winners-carousel-photo"
                    src={winner.dog_photo_url || dogPlaceholder}
                    alt={winner.dog_name}
                  />
                  <span className="winners-carousel-dog-name">{winner.dog_name}</span>
                  <span className="winners-carousel-dog-owner">{winner.owner_name}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {breedsData.length > 1 && (
        <button
          className="winners-carousel-arrow winners-carousel-arrow--right"
          onClick={handleNext}
        >
          <img src={arrowRight} alt="Вперёд" />
        </button>
      )}
    </div>
  );
};

export default WinnersCarousel;