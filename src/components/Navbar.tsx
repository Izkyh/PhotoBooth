import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0"
        >
          <img
            src="/fotoreklogo.png"
            alt="FotoRek Logo"
            className="h-24 w-auto hover:opacity-80 transition-opacity"
          />
        </button>
        <button
          onClick={() => navigate('/offline')}
          className="text-sm font-semibold text-gray-700 hover:text-blue-600 px-6 py-2 rounded-full border border-gray-300 hover:border-blue-400 transition-all"
        >
          Lokasi Offline
        </button>
      </div>
    </header>
  );
};
