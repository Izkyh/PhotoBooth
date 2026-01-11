import { ArrowUp, Users, Camera, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Komponen Kartu Statistik Kecil
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-center gap-1 text-green-500 text-sm font-bold bg-green-50 px-2 py-1 rounded-full">
        <ArrowUp className="w-3 h-3" />
        {change}%
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-black text-gray-900">{value}</p>
  </div>
);

const DashboardPage = () => {
    const navigate = useNavigate();

  // Data Dummy untuk Grafik
  const monthlyStats = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 65 },
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 90 },
    { month: 'May', value: 75 },
    { month: 'Jun', value: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Frames" 
          value="12" 
          change="12.5" 
          icon={ImageIcon} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Photos Taken" 
          value="1,248" 
          change="8.2" 
          icon={Camera} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Active Users" 
          value="854" 
          change="24.3" 
          icon={Users} 
          color="bg-orange-500" 
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Photos Overview (Last 6 Months)</h3>
          
          {/* Simple CSS Bar Chart */}
          <div className="flex items-end justify-between h-64 gap-4">
            {monthlyStats.map((stat, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative h-full flex items-end bg-gray-50 rounded-xl overflow-hidden">
                   <div 
                    style={{ height: `${stat.value}%` }} 
                    className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-500 relative rounded-t-xl"
                   >
                     {/* Tooltip */}
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                       {stat.value * 10} Photos
                     </div>
                   </div>
                </div>
                <span className="text-sm text-gray-500 font-medium">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Info */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-2">Pro Tips</h3>
            <p className="text-blue-100 leading-relaxed">
              Adding new seasonal frames can increase user engagement by up to 40% during holidays!
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/frames/create')}
            className="bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg mt-6"
          >
            Create New Frame
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;