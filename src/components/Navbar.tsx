import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-white  z-50">
      <div className="w-full px-[130px] h-16 flex items-center justify-between">
        {/* Logo kiri, jarak mirip desain */}
        <button
          onClick={() => navigate('/')}
          className="flex-shrink-0"
        >
          <img
            src="/fotoreklogo.png"
            alt="FotoRek Logo"
            className="h-[150px] w-auto "
          />
        </button>

        {/* Tombol kanan */}
        <button
          onClick={() => navigate('/offline')}
          className="text-lg font-semibold text-gray-700 px-8 py-2.5 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          Lokasi Offline
        </button>
      </div>
    </header>
  );
};
