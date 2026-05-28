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
import ProfilePage from './pages/ProfilePage';
import CreateExhibitionPage from './pages/CreateExhibitionPage';
import ExhibitionDetailPage from './pages/ExhibitionDetailPage';
import RequestsPage from './pages/RequestsPage';
import FixResultsPage from './pages/FixResultsPage';
import CreateClubPage from './pages/CreateClubPage';
import ClubDetailPage from './pages/ClubDetailPage';

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/exhibitions/create" element={<CreateExhibitionPage />} />
          <Route path="/exhibitions/:id" element={<ExhibitionDetailPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/exhibitions/:id/fix-results" element={<FixResultsPage />} />
          <Route path="/admin/clubs/create" element={<CreateClubPage />} />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;