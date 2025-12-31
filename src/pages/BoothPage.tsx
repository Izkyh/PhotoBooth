import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera } from "../components/Camera";
import { PhotoStrip } from "../components/PhotoStrip";
import type { Photo, FilterType, LayoutType } from "../types";
import { Camera as CameraIcon, RotateCcw, Home } from "lucide-react";

export const BoothPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialLayout = (location.state?.layout as LayoutType) || "vertical-4";

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentFilter] = useState<FilterType>("none");
  const [currentLayout] = useState<LayoutType>(initialLayout);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  // const [photoCount, setPhotoCount] = useState(0);
  const [cameraStarted, setCameraStarted] = useState(false);

  // horizontal-2x2 = 3 photos, vertical-4 = 4 photos, single = 1 photo
  // Update maxPhotos calculation
  const maxPhotos =
    currentLayout === "single"
      ? 1
      : currentLayout === "horizontal-2x2"
      ? 4
      : currentLayout === "grid-2x3"
      ? 6
      : 4;
  const startPhotoSession = () => {
    setCameraStarted(true);
    setPhotos([]);
    setIsCapturing(true);
    setCountdown(3);
  };

  const handleCapture = useCallback(
    (dataUrl: string) => {
      const newPhoto: Photo = {
        id: Date.now(),
        dataUrl,
        timestamp: Date.now(),
      };

      setPhotos((prev) => {
        const updatedPhotos = [...prev, newPhoto];

        // Check if this is the last photo
        if (updatedPhotos.length >= maxPhotos) {
          setIsCapturing(false);
          setCountdown(0);
          // Auto redirect ke customize page setelah selesai
          setTimeout(() => {
            navigate("/customize", {
              state: {
                photos: updatedPhotos,
                layout: currentLayout,
                filter: 'none',
              },
            });
          }, 2500);
        } else {
          // Continue capturing next photo
          setTimeout(() => setCountdown(3), 1000);
        }

        return updatedPhotos;
      });

      // setPhotoCount((prev) => prev + 1);
      setCountdown(0);
    },
    [maxPhotos, navigate, currentLayout, currentFilter]
  );

  useEffect(() => {
    if (countdown > 0 && isCapturing) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
      setCameraStarted(true);
    }
  }, [countdown, isCapturing]);

  const resetSession = () => {
    setPhotos([]);
    setIsCapturing(false);
    setCountdown(0);
    setCameraStarted(false);
  };

  // Get layout description
  const getLayoutDescription = () => {
    if (currentLayout === "horizontal-2x2") return "4 photos";
    if (currentLayout === "vertical-4") return "4 photos";
    if (currentLayout === "grid-2x3") return "6 photos";
    return "1 photo";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
      {/* Top Bar */}
      <div className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Poto
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Selected:{" "}
              {currentLayout === "horizontal-2x2"
                ? "Layout B"
                : currentLayout === "vertical-4"
                ? "Layout A"
                : "Layout C"}{" "}
              ({getLayoutDescription()})
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-700 transition-all border border-gray-600/50"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera */}
          <div className="space-y-4">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <Camera
                onCapture={handleCapture}
                countdown={countdown}
                isCapturing={isCapturing}
                shouldStartCamera={cameraStarted}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startPhotoSession}
                disabled={isCapturing}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl disabled:shadow-none hover:scale-105 disabled:cursor-not-allowed"
              >
                <CameraIcon className="w-5 h-5" />
                {isCapturing
                  ? `Photo ${photos.length + 1}/${maxPhotos}`
                  : "Start Capture"}
              </button>

              <button
                onClick={resetSession}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <PhotoStrip
              photos={photos}
              filter={currentFilter}
              layout={currentLayout}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
