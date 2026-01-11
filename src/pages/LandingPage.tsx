import { useNavigate } from 'react-router-dom';
import { Camera, Wand2, Download, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FooterHowTo } from '../components/FooterHowTo';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: 'Auto Capture',
      description: '3-second countdown for perfectly timed shots every time',
    },
    {
      icon: Wand2,
      title: 'Creative Filters',
      description: 'Apply beautiful filters to enhance your photos instantly',
    },
    {
      icon: Download,
      title: 'Instan Download',
      description: 'Get your photo strip instantly with Foto Rek! watermark',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Snap The Moment with Foto Rek!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A fun way to capture and keep your memories.
          </p>
          <button
            onClick={() => navigate('/layout')}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition-all"
          >
            Start Photo Session
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-3xl p-8 border-2 border-gray-200 text-center hover:border-gray-300 hover:shadow-lg transition-all">
                  <div className="bg-black w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div>
        <br />
        <br />
        <br />
      </div>


      {/* How To Section */}
      <FooterHowTo />
    </div>
  );
};