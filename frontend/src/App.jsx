import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import DogsPage from './pages/DogsPage';
import ExpertsPage from './pages/ExpertsPage';
import ClubsPage from './pages/ClubsPage';
import AddDogPage from './pages/AddDogPage';
import DogDetailPage from './pages/DogDetailPage';
import EditDogPage from './pages/EditDogPage';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="/dogs" element={<DogsPage />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/dogs/register" element={<AddDogPage />} />
          <Route path="/dogs/:id" element={<DogDetailPage />} />
          <Route path="/dogs/:id/edit" element={<EditDogPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;