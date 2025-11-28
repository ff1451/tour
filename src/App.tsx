import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import { useEffect } from 'react';
import { setWeatherServiceKey } from './api/weatherAPI';
import { setServiceKey } from './api/tourAPI';
import { setPhotoAwardServiceKey } from './api/photoAwardAPI';
import { API_KEY } from './api/api.config';

function App() {
  useEffect(() => {
    setServiceKey(API_KEY);
    setWeatherServiceKey(API_KEY);
    setPhotoAwardServiceKey(API_KEY);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
