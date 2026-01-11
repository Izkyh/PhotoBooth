import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera } from '../components/Camera';
import { PhotoStrip } from '../components/PhotoStrip';
import type { Photo, FilterType, LayoutType } from '../types';
import {
  Camera as CameraIcon,
  RotateCcw,
  Home,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const BoothPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialLayout = (location.state?.layout as LayoutType) || 'vertical-4';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentFilter] = useState<FilterType>('none');
  const [currentLayout] = useState<LayoutType>(initialLayout);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cameraStarted] = useState(true);

  const maxPhotos =
    currentLayout === 'single'
      ? 1
      : currentLayout === 'horizontal-2x2'
      ? 4
      : currentLayout === 'grid-2x3'
      ? 6
      : 4;

  const startPhotoSession = () => {
    setPhotos([]);
    setIsCapturing(true);
    setCountdown(3);
  };

  const captureNext = () => {
    setIsCapturing(true);
    setCountdown(3);
  };

  const retakeLastPhoto = () => {
    setPhotos(prev => prev.slice(0, -1));
    setIsCapturing(true);
    setCountdown(3);
  };

  const handleCapture = useCallback((dataUrl: string) => {
    const newPhoto: Photo = {
      id: Date.now(),
      dataUrl,
      timestamp: Date.now(),
    };
    setPhotos(prev => [...prev, newPhoto]);
    setIsCapturing(false);
    setCountdown(0);
  }, []);

  useEffect(() => {
    if (countdown > 0 && isCapturing) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isCapturing]);

  const resetSession = () => {
    setPhotos([]);
    setIsCapturing(false);
    setCountdown(0);
  };

  const getLayoutDescription = () => {
    if (currentLayout === 'horizontal-2x2') return '2x2 Grid • 4 photos';
    if (currentLayout === 'vertical-4') return '4 Vertical • 4 photos';
    if (currentLayout === 'grid-2x3') return '2x3 Grid • 6 photos';
    return 'Single • 1 photo';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Camera card + teks di dalam */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-300">
                {/* header kecil di dalam card */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {getLayoutDescription()}
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-300 overflow-hidden">
                  <Camera
                    onCapture={handleCapture}
                    countdown={countdown}
                    isCapturing={isCapturing}
                    shouldStartCamera={cameraStarted}
                  />
                </div>

                {/* Controls */}
                <div className="mt-4 space-y-3">
                  {photos.length === 0 ? (
                    <button
                      onClick={startPhotoSession}
                      disabled={isCapturing}
                      className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed"
                    >
                      <CameraIcon className="w-5 h-5" />
                      Start Photo Session
                    </button>
                  ) : (
                    <>
                      {/* baris Next + Retake selalu ada selama sudah pernah foto */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={captureNext}
                          disabled={isCapturing || photos.length >= maxPhotos}
                          className={`bg-black text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm ${
                            isCapturing || photos.length >= maxPhotos
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-900'
                          }`}
                        >
                          <CameraIcon className="w-5 h-5" />
                          <span className="text-sm">
                            {isCapturing
                              ? 'Capturing...'
                              : `Next (${Math.min(
                                  photos.length + 1,
                                  maxPhotos
                                )}/${maxPhotos})`}
                          </span>
                        </button>
                        <button
                          onClick={retakeLastPhoto}
                          disabled={isCapturing || photos.length === 0}
                          className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-200 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span className="text-sm">Retake</span>
                        </button>
                      </div>

                      {/* Reset All */}
                      <button
                        onClick={resetSession}
                        className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                        Reset All Photos
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Preview tetap sama */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-800">
                    Preview
                  </span>
                  <span className="text-xs text-gray-600">
                    {photos.length}/{maxPhotos} Photos
                  </span>
                </div>

                <div className="mb-4">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 bg-black rounded-full"
                      style={{
                        width: `${(photos.length / maxPhotos) * 100}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 border border-dashed border-gray-300 rounded-2xl bg-gray-50 flex items-center justify-center px-4 py-6">
                  {photos.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      <p className="font-semibold mb-1">No Photos Yet</p>
                      <p className="text-xs">
                        Start capturing to see your photo strip ({maxPhotos}{' '}
                        photos)
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex justify-center">
                      <PhotoStrip
                        photos={photos}
                        filter={currentFilter}
                        layout={currentLayout}
                        showDownload={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {photos.length === maxPhotos && !isCapturing && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() =>
                navigate('/customize', {
                  state: { photos, layout: currentLayout, filter: 'none' },
                })
              }
              className="px-10 py-3.5 bg-black hover:bg-gray-900 text-white font-semibold rounded-full flex items-center gap-2 shadow-md"
            >
              Continue to Customize
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

