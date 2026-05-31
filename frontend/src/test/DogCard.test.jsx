import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DogCard from '../components/DogCard';

describe('DogCard', () => {
  const dog = {
    id: 1,
    name: 'Рекс',
    breed_name: 'Овчарка',
    owner_name: 'Иванов Иван Иванович',
    club_name: 'Чёрный плащ',
    photo_url: null,
  };

  it('отображает кличку собаки', () => {
    render(
      <MemoryRouter>
        <DogCard dog={dog} />
      </MemoryRouter>
    );
    expect(screen.getByText('Рекс')).toBeInTheDocument();
  });

  it('отображает породу', () => {
    render(
      <MemoryRouter>
        <DogCard dog={dog} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Овчарка/)).toBeInTheDocument();
  });

  it('отображает владельца', () => {
    render(
      <MemoryRouter>
        <DogCard dog={dog} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Иванов Иван Иванович/)).toBeInTheDocument();
  });

  it('отображает клуб в кавычках', () => {
    render(
      <MemoryRouter>
        <DogCard dog={dog} />
      </MemoryRouter>
    );
    expect(screen.getByText(/«Чёрный плащ»/)).toBeInTheDocument();
  });

  it('показывает "Без клуба", если клуб не указан', () => {
    const dogNoClub = { ...dog, club_name: null };
    render(
      <MemoryRouter>
        <DogCard dog={dogNoClub} />
      </MemoryRouter>
    );
    expect(screen.getByText('Без клуба')).toBeInTheDocument();
  });

  it('добавляет класс dog-card--owner, если isOwner=true', () => {
    const { container } = render(
      <MemoryRouter>
        <DogCard dog={dog} isOwner={true} />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass('dog-card--owner');
  });
});