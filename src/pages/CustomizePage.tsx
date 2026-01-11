import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Palette } from "lucide-react";
import type { Photo, FilterType, LayoutType, FrameColor } from "../types";
import { applyFilter } from "../utils/filters";
import { FilterPanel } from "../components/FilterPanel";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

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

    let CANVAS_WIDTH: number;
    let CANVAS_HEIGHT: number;
    let photoWidth: number;
    let photoHeight: number;
    let maxPhotos: number;
    let cols: number;
    let rows: number;

    const WATERMARK_HEIGHT = 60;
    const FRAME_PADDING = 40;

    if (layout === "vertical-4") {
      CANVAS_WIDTH = 600;
      CANVAS_HEIGHT = 1800;
      cols = 1;
      rows = 4;
      photoWidth = CANVAS_WIDTH - FRAME_PADDING * 2;
      photoHeight =
        (CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * (rows + 1)) / rows;
      maxPhotos = 4;
    } else if (layout === "horizontal-2x2") {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 2;
      rows = 2;
      photoWidth = (CANVAS_WIDTH - FRAME_PADDING * (cols + 1)) / cols;
      photoHeight =
        (CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * (rows + 1)) / rows;
      maxPhotos = 4;
    } else if (layout === "grid-2x3") {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 2;
      rows = 3;
      photoWidth = (CANVAS_WIDTH - FRAME_PADDING * (cols + 1)) / cols;
      photoHeight =
        (CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * (rows + 1)) / rows;
      maxPhotos = 6;
    } else {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 1;
      rows = 1;
      photoWidth = CANVAS_WIDTH - FRAME_PADDING * 2;
      photoHeight = CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * 2;
      maxPhotos = 1;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const selectedFrameColor =
      frameColor === "custom"
        ? customColor
        : frameColors.find((f) => f.value === frameColor)?.color || "#ffffff";

    // background frame
    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoPromises = photos.slice(0, maxPhotos).map((photo, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);

          const x = FRAME_PADDING + col * (photoWidth + FRAME_PADDING);
          const y = FRAME_PADDING + row * (photoHeight + FRAME_PADDING);

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = photoWidth;
          tempCanvas.height = photoHeight;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) {
            resolve();
            return;
          }

          const imgAspect = img.width / img.height;
          const boxAspect = photoWidth / photoHeight;

          let drawWidth: number;
          let drawHeight: number;
          let drawX: number;
          let drawY: number;

          if (imgAspect > boxAspect) {
            drawHeight = photoHeight;
            drawWidth = drawHeight * imgAspect;
            drawX = (photoWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = photoWidth;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (photoHeight - drawHeight) / 2;
          }

          tempCtx.fillStyle = selectedFrameColor;
          tempCtx.fillRect(0, 0, photoWidth, photoHeight);
          tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

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

          ctx.drawImage(tempCanvas, x, y, photoWidth, photoHeight);
          resolve();
        };

        img.onerror = () => resolve();
        img.src = photo.dataUrl;
      });
    });

    await Promise.all(photoPromises);

    // watermark
    const watermarkY = canvas.height - 30;
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#666666";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FotoRek!", canvas.width / 2, watermarkY);
  };

  const downloadPhotoStrip = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `fotorek-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    link.click();
  };


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          {/* Header text */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Customize Your Photos
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Layout{" "}
              {layout === "horizontal-2x2"
                ? "2x2 Grid (1200×1800)"
                : layout === "vertical-4"
                ? "4 Vertical (600×1800)"
                : layout === "grid-2x3"
                ? "2x3 Grid (1200×1800)"
                : "Single (1200×1800)"}{" "}
              • {photos.length} photos captured
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Preview */}
            <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-3xl p-8 flex items-center justify-center">
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

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black">
                    <span className="text-[10px] text-white font-semibold">
                      Fx
                    </span>
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                </div>
                <FilterPanel
                  currentFilter={currentFilter}
                  onFilterChange={setCurrentFilter}
                />
              </div>

              {/* Frame Color */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-gray-900" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Frame Color
                  </h3>
                </div>

                {/* deretan bulatan warna saja */}
                <div className="flex flex-wrap gap-3">
                  {frameColors.map((frame) => (
                    <button
                      key={frame.value}
                      onClick={() => setFrameColor(frame.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-all`}
                      style={{
                        backgroundColor: frame.color,
                        borderColor:
                          frameColor === frame.value ? "#000000" : "#e5e7eb",
                        boxShadow:
                          frameColor === frame.value
                            ? "0 0 0 2px #00000033"
                            : "none",
                      }}
                      aria-label={frame.label}
                    />
                  ))}
                </div>

                {/* Custom color */}
                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 font-semibold">
                    Custom
                  </span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setFrameColor("custom");
                    }}
                    className="w-10 h-8 rounded-md border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={downloadPhotoStrip}
                  className="flex-1 bg-black hover:bg-gray-900 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => navigate("/booth", { state: { layout } })}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3.5 px-6 rounded-xl border border-gray-300"
                >
                  Take New Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
