import { MapPin, ExternalLink, Search } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const locations = [
  {
    id: 1,
    city: 'Tasikmalaya',
    name: 'Wey by Praya',
    address: 'Jl. Sukalaya I No.3, Argasari, Kec. Cihideung, Kab. Tasikmalaya',
    mapsUrl: 'https://maps.google.com',
  },
  {
    id: 2,
    city: 'Surabaya',
    name: 'ITS - Graha Rektorat',
    address: 'Jl. Sukalaya I No.3, Argasari, Kec. Cihideung, Kab. Tasikmalaya',
    mapsUrl: 'https://maps.google.com',
  },
  {
    id: 3,
    city: 'Malang',
    name: 'UMM - Danau 1',
    address: 'Jl. Sukalaya I No.3, Argasari, Kec. Cihideung, Kab. Tasikmalaya',
    mapsUrl: 'https://maps.google.com',
  },
];

export const OfflineLocationPage = () => {

  const openMaps = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Our Offline Locations
            </h1>
            <p className="text-lg text-gray-600">
              Find Foto Rek! near you
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan kota"
                className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-gray-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Locations grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map(loc => (
              <div
                key={loc.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                {/* City pill */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
                    {loc.city}
                  </span>
                </div>

                {/* Name + address */}
                <div className="space-y-2 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {loc.name}
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {loc.address}
                  </p>
                </div>

                {/* Open in maps */}
                <button
                  onClick={() => openMaps(loc.mapsUrl)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 mt-auto"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in maps</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
