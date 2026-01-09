import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera } from "../components/Camera";
import { PhotoStrip } from "../components/PhotoStrip";
import type { Photo, FilterType, LayoutType } from "../types";
import {
  Camera as CameraIcon,
  RotateCcw,
  Home,
  ArrowRight,
  Trash2,
} from "lucide-react";

export const BoothPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialLayout = (location.state?.layout as LayoutType) || "vertical-4";
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentFilter] = useState<FilterType>("none");
  const [currentLayout] = useState<LayoutType>(initialLayout);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cameraStarted] = useState(true);

  const maxPhotos =
    currentLayout === "single"
      ? 1
      : currentLayout === "horizontal-2x2"
      ? 4
      : currentLayout === "grid-2x3"
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

  // ✅ NEW: Retake last photo
  const retakeLastPhoto = () => {
    setPhotos((prev) => prev.slice(0, -1)); // Remove last photo
    setIsCapturing(true);
    setCountdown(3);
  };

  const handleCapture = useCallback((dataUrl: string) => {
    const newPhoto: Photo = {
      id: Date.now(),
      dataUrl,
      timestamp: Date.now(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
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
    if (currentLayout === "horizontal-2x2") return "4 photos";
    if (currentLayout === "vertical-4") return "4 photos";
    if (currentLayout === "grid-2x3") return "6 photos";
    return "1 photo";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 relative flex items-center">
          <div className="flex items-center">
            <div className="h-14 flex items-center overflow-visible">
              <img
                src="/src/assets/fotoreklogo.png"
                alt="FotoRek Logo"
                className="h-10 w-auto object-contain scale-[1.8] origin-left"
              />
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 px-2">
            <p className="text-xs font-medium text-gray-500 text-center whitespace-nowrap">
              Selected:{" "}
              {currentLayout === "horizontal-2x2"
                ? "Layout B"
                : currentLayout === "vertical-4"
                ? "Layout A"
                : "Layout C"}{" "}
              ({getLayoutDescription()})
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-100 shadow-sm hover:bg-gray-50 transition-all"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <Camera
                onCapture={handleCapture}
                countdown={countdown}
                isCapturing={isCapturing}
                shouldStartCamera={cameraStarted}
              />
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              {photos.length === 0 ? (
                // Initial Start Button
                <button
                  onClick={startPhotoSession}
                  disabled={isCapturing}
                  className="w-full bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:cursor-not-allowed"
                >
                  <CameraIcon className="w-5 h-5" />
                  Start Photo Session
                </button>
              ) : photos.length < maxPhotos ? (
                // Next & Retake Buttons
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={captureNext}
                    disabled={isCapturing}
                    className="bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:cursor-not-allowed"
                  >
                    <CameraIcon className="w-5 h-5" />
                    <span className="text-sm">
                      {isCapturing
                        ? "Capturing..."
                        : `Next (${photos.length + 1}/${maxPhotos})`}
                    </span>
                  </button>
                  <button
                    onClick={retakeLastPhoto}
                    disabled={isCapturing}
                    className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-sm">Retake</span>
                  </button>
                </div>
              ) : null}

              {/* Reset All Button - Always visible after first photo */}
              {photos.length > 0 && (
                <button
                  onClick={resetSession}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Reset All Photos
                </button>
              )}
            </div>

            {/* Progress Indicator */}
            {photos.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-bold text-sm">
                    Photo Progress
                  </span>
                  <span className="text-2xl font-black text-blue-600">
                    {photos.length}/{maxPhotos}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${(photos.length / maxPhotos) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Preview Section */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <PhotoStrip
              photos={photos}
              filter={currentFilter}
              layout={currentLayout}
              showDownload={false}
            />
            {/* Next to Customize Button */}
            {photos.length >= maxPhotos && !isCapturing && (
              <button
                onClick={() =>
                  navigate("/customize", {
                    state: { photos, layout: currentLayout, filter: "none" },
                  })
                }
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-4 transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                Continue to Customize
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
