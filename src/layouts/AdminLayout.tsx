import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  LogOut, 
  ChevronDown, 
  User
} from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Menu Sidebar
  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Frame Photo', 
      path: '/admin/frames', 
      icon: ImageIcon 
    }
  ];

  const handleLogout = () => {
    // Hapus token/session jika ada
    navigate('/login');
  };

  // Judul halaman dinamis berdasarkan path
  const getPageTitle = () => {
    if (location.pathname.includes('/frames')) return 'Frame Management';
    return 'Dashboard Overview';
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 flex flex-col">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
             {/* Ganti src dengan logo kamu */}
            <img src="/src/assets/fotoreklogo.png" alt="Logo" className="h-10 w-auto" />
            {/* <span className="font-black text-xl text-gray-800">FotoRek!</span> */}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">Status System</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-600">Online & Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* === MAIN CONTENT WRAPPER === */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* === TOPBAR === */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          {/* Left: Page Title (Mobile Hamburger could go here) */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">{getPageTitle()}</h2>
          </div>

          {/* Right: Account Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-700">Admin FotoRek</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* === PAGE CONTENT (Injects Dashboard or FrameList here) === */}
        <main className="p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};