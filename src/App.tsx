import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import FestivalPage from './pages/FestivalPage';
import AccommodationPage from './pages/AccommodationPage';
import TourCoursePage from './pages/TourCoursePage';
import DestinationsPage from './pages/DestinationsPage';
import MyTripPage from './pages/MyTripPage';
import MyPage from './pages/MyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/detail/:contentId" element={<DetailPage />} />
        <Route path="/festivals" element={<FestivalPage />} />
        <Route path="/accommodations" element={<AccommodationPage />} />
        <Route path="/courses" element={<TourCoursePage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/my-trip" element={<MyTripPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
