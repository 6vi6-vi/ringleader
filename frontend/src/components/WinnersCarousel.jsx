import { useState } from 'react';
import WinnerCard from './WinnerCard';
import arrowLeft from '../images/arrow-left.png';
import arrowRight from '../images/arrow-right.png';
import photoPlaceholder from '../images/photo-placeholder.jpg';
import './WinnersCarousel.css';

const WinnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const breeds = [
    {
      breedName: 'Немецкая овчарка',
      winners: [
        { place: 1, name: 'Зефирка', owner: 'Орлова А. К.', photo: photoPlaceholder },
        { place: 2, name: 'Принц', owner: 'Осипов М. Л.', photo: photoPlaceholder },
        { place: 3, name: 'Аврора', owner: 'Кузнецов Д. В.', photo: photoPlaceholder },
      ],
    },
    {
      breedName: 'Лабрадор',
      winners: [
        { place: 1, name: 'Дана', owner: 'Федотов А. Т.', photo: photoPlaceholder },
        { place: 2, name: 'Ларри', owner: 'Амвросов М. Д.', photo: photoPlaceholder },
        { place: 3, name: 'Стелла', owner: 'Петрова Е. С.', photo: photoPlaceholder },
      ],
    },
    {
      breedName: 'Такса',
      winners: [
        { place: 1, name: 'Чиф', owner: 'Сидорова О. Н.', photo: photoPlaceholder },
        { place: 2, name: 'Ханна', owner: 'Белов Р. Д.', photo: photoPlaceholder },
        { place: 3, name: 'Мотя', owner: 'Иванов А. А.', photo: photoPlaceholder },
      ],
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? breeds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === breeds.length - 1 ? 0 : prev + 1));
  };

  const currentBreed = breeds[currentIndex];

  return (
    <div className="winners-carousel">
      <button
        className="winners-carousel-arrow winners-carousel-arrow--left"
        onClick={handlePrev}
      >
        <img src={arrowLeft} alt="Назад" />
      </button>

      <div className="winners-carousel-content">
        <h3 className="winners-carousel-breed">{currentBreed.breedName}</h3>

        <div className="winners-carousel-cards">
          {currentBreed.winners.map((winner) => (
            <WinnerCard key={winner.place} {...winner} />
          ))}
        </div>
      </div>

      <button
        className="winners-carousel-arrow winners-carousel-arrow--right"
        onClick={handleNext}
      >
        <img src={arrowRight} alt="Вперёд" />
      </button>
    </div>
  );
};

export default WinnersCarousel;