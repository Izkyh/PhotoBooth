import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Tambahkan Navigate

// Import Pages Public
import { LandingPage } from './pages/LandingPage';
import { OnlineHomepage } from './pages/OnlineHomepage'; 
import { OfflineLocationPage } from './pages/OfflineLocationPage';
import { LayoutSelectionPage } from './pages/LayoutSelectionPage';
import { BoothPage } from './pages/BoothPage';
import { CustomizePage } from './pages/CustomizePage';
import LoginPage from './pages/LoginPage';

// Import Admin Layout & Pages
import { AdminLayout } from './layouts/AdminLayout'; 
import DashboardPage from './pages/DashboardPage';
import { AdminFrameList } from './pages/AdminFrameList';
import { AdminFrameEditor } from './pages/AdminFrameEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/online" element={<OnlineHomepage />} />
        <Route path="/offline" element={<OfflineLocationPage />} />
        <Route path="/layout" element={<LayoutSelectionPage />} />
        <Route path="/booth" element={<BoothPage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* === ADMIN ROUTES === */}
        {/* Semua route di dalam wrapper ini akan memiliki Sidebar & Header */}
        <Route element={<AdminLayout />}>
           
           {/* 1. Dashboard Route */}
           <Route path="/dashboard" element={<DashboardPage />} />
           
           {/* 2. Redirect /admin supaya otomatis masuk ke dashboard */}
           {/* Ini opsional, tapi bagus biar url konsisten */}
           <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
           
           {/* 3. Frame Management Routes */}
           <Route path="/admin/frames" element={<AdminFrameList />} />
           <Route path="/admin/frames/create" element={<AdminFrameEditor />} />
           <Route path="/admin/frames/edit/:id" element={<AdminFrameEditor />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;