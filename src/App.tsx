import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { OfflineLocationPage } from './pages/OfflineLocationPage';
import { LayoutSelectionPage } from './pages/LayoutSelectionPage';
import { BoothPage } from './pages/BoothPage';
import { CustomizePage } from './pages/CustomizePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Choice screen */}
        <Route path="/offline" element={<OfflineLocationPage />} />
        <Route path="/layout" element={<LayoutSelectionPage />} />
        <Route path="/booth" element={<BoothPage />} />
        <Route path="/customize" element={<CustomizePage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;