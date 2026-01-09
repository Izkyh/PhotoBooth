import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Palette } from "lucide-react";
import type { Photo, FilterType, LayoutType, FrameColor } from "../types";
import { applyFilter } from "../utils/filters";
import { FilterPanel } from "../components/FilterPanel";

export const CustomizePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photos = (location.state?.photos as Photo[]) || [];
  const layout = (location.state?.layout as LayoutType) || "horizontal-2x2";
  const initialFilter = (location.state?.filter as FilterType) || "none";
  const [currentFilter, setCurrentFilter] = useState<FilterType>(initialFilter);
  const [frameColor, setFrameColor] = useState<FrameColor>("white");
  const [customColor, setCustomColor] = useState("#ffffff");

  const frameColors: { value: FrameColor; label: string; color: string }[] = [
    { value: "white", label: "White", color: "#ffffff" },
    { value: "black", label: "Black", color: "#000000" },
    { value: "pink", label: "Pink", color: "#ffc0cb" },
    { value: "green", label: "Green", color: "#90ee90" },
    { value: "blue", label: "Blue", color: "#87ceeb" },
    { value: "yellow", label: "Yellow", color: "#ffeb3b" },
    { value: "purple", label: "Purple", color: "#da70d6" },
    { value: "maroon", label: "Maroon", color: "#800000" },
    { value: "burgundy", label: "Burgundy", color: "#8b0032" },
  ];

  useEffect(() => {
    if (photos.length === 0) {
      navigate("/layout");
      return;
    }
    renderPhotoStrip();
  }, [photos, frameColor, customColor, currentFilter, layout]);

  const renderPhotoStrip = async () => {
    if (!canvasRef.current || photos.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameThickness = 60;
    let photoWidth: number, photoHeight: number, photosToRender: number;

    if (layout === "horizontal-2x2") {
      photoWidth = (1200 - frameThickness * 3) / 2;
      photoHeight = (1800 - frameThickness * 3) / 2;
      photosToRender = Math.min(photos.length, 4);
      canvas.width = 1200;
      canvas.height = 1800;
    } else if (layout === "vertical-4") {
      photoWidth = 500;
      photoHeight = 370;
      photosToRender = Math.min(photos.length, 4);
      canvas.width = photoWidth + frameThickness * 2;
      canvas.height = photoHeight * 4 + frameThickness * 5;
    } else if (layout === "grid-2x3") {
      photoWidth = (1200 - frameThickness * 4) / 3;
      photoHeight = (1800 - frameThickness * 3) / 2;
      photosToRender = Math.min(photos.length, 6);
      canvas.width = 1200;
      canvas.height = 1800;
    } else {
      // Single photo
      photoWidth = 600;
      photoHeight = 800;
      photosToRender = Math.min(photos.length, 1);
      canvas.width = photoWidth + frameThickness * 2;
      canvas.height = photoHeight + frameThickness * 2;
    }

    const selectedFrameColor =
      frameColor === "custom"
        ? customColor
        : frameColors.find((f) => f.value === frameColor)?.color || "#ffffff";

    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoPromises = photos
      .slice(0, photosToRender)
      .map((photo, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = photoWidth;
            tempCanvas.height = photoHeight;
            const tempCtx = tempCanvas.getContext("2d");

            if (!tempCtx) {
              resolve();
              return;
            }

            // Fill background dengan frame color
            tempCtx.fillStyle = selectedFrameColor;
            tempCtx.fillRect(0, 0, photoWidth, photoHeight);

            const imgAspect = img.width / img.height;
            const boxAspect = photoWidth / photoHeight;

            let drawWidth: number;
            let drawHeight: number;
            let offsetX = 0;
            let offsetY = 0;

            if (imgAspect > boxAspect) {
              // Image lebih lebar - crop kiri kanan
              drawHeight = photoHeight;
              drawWidth = photoHeight * imgAspect;
              offsetX = (photoWidth - drawWidth) / 2; // Center crop
            } else {
              // Image lebih tinggi - crop atas bawah
              drawWidth = photoWidth;
              drawHeight = photoWidth / imgAspect;
              offsetY = (photoHeight - drawHeight) / 2; // Center crop
            }

            // Draw image (will auto-crop excess)
            tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            // Apply filter jika ada
            if (currentFilter !== "none") {
              const imageData = tempCtx.getImageData(
                0,
                0,
                photoWidth,
                photoHeight
              );
              const filtered = applyFilter(imageData, currentFilter);
              tempCtx.putImageData(filtered, 0, 0);
            }

            // Calculate position based on layout
            let x = frameThickness;
            let y = frameThickness;

            if (layout === "grid-2x3") {
              x = frameThickness + (index % 3) * (photoWidth + frameThickness);
              y =
                frameThickness +
                Math.floor(index / 3) * (photoHeight + frameThickness);
            } else if (layout === "horizontal-2x2") {
              x = frameThickness + (index % 2) * (photoWidth + frameThickness);
              y =
                frameThickness +
                Math.floor(index / 2) * (photoHeight + frameThickness);
            } else if (layout === "vertical-4") {
              y = frameThickness + index * (photoHeight + frameThickness);
            }

            // Draw to main canvas
            ctx.drawImage(tempCanvas, x, y, photoWidth, photoHeight);

            resolve();
          };

          img.onerror = () => {
            console.error("Failed to load image:", index);
            resolve();
          };

          img.src = photo.dataUrl;
        });
      });

    await Promise.all(photoPromises);
  };

  const downloadPhotoStrip = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = `fotorek-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Photo Strip Preview
          </h1>
          <p className="text-gray-500">
            Layout:{" "}
            {layout === "horizontal-2x2"
              ? "Layout B (4 photos)"
              : layout === "vertical-4"
              ? "Layout A (4 photos)"
              : layout === "grid-2x3"
              ? "Layout D (6 photos)"
              : "Layout C (1 photo)"}{" "}
            • Photos captured: {photos.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Preview */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl flex items-center justify-center shadow-sm">
            <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "70vh",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <FilterPanel
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
              />
            </div>

            {/* Frame Color Panel */}
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">Frame Color</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {frameColors.map((frame) => (
                  <button
                    key={frame.value}
                    onClick={() => setFrameColor(frame.value)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
                      frameColor === frame.value
                        ? "bg-gradient-to-r from-blue-100 to-blue-300 text-white border-blue-400"
                        : "bg-blue-50 text-gray-600 border-blue-100 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: frame.color }}
                      />
                      <span className="text-sm">{frame.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {/* Custom Color Picker */}
              <div className="mt-4 pt-4 border-t border-blue-100">
                <label className="flex items-center gap-3 text-sm text-gray-600 font-semibold">
                  <span>Custom Color:</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setFrameColor("custom");
                    }}
                    className="w-16 h-10 rounded-lg cursor-pointer bg-blue-50 border-2 border-blue-200 shadow-sm"
                  />
                </label>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadPhotoStrip}
                className="w-full bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download Photo Strip
              </button>
              <button
                onClick={() => navigate("/booth", { state: { layout } })}
                className="w-full bg-white hover:bg-blue-50 text-gray-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-blue-200 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                Take New Photos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
