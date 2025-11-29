import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import FestivalPage from './pages/FestivalPage';
import AccommodationPage from './pages/AccommodationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/detail/:contentId" element={<DetailPage />} />
        <Route path="/festivals" element={<FestivalPage />} />
        <Route path="/accommodations" element={<AccommodationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
