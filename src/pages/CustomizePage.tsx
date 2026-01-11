import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Palette, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Photo, FilterType, LayoutType, FrameColor } from "../types";
import { applyFilter } from "../utils/filters";
import { FilterPanel } from "../components/FilterPanel";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface APIFrame {
  id: number;
  name: string;
  bgImageData: string; 
  slots: {
    relativeX: number;
    relativeY: number;
    relativeWidth: number;
    relativeHeight: number;
  }[];
}

export const CustomizePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const photos = (location.state?.photos as Photo[]) || [];
  const layout = (location.state?.layout as LayoutType) || "horizontal-2x2";
  const initialFilter = (location.state?.filter as FilterType) || "none";

  const [currentFilter, setCurrentFilter] = useState<FilterType>(initialFilter);
  const [frameMode, setFrameMode] = useState<'color' | 'custom'>('color');
  const [frameColor, setFrameColor] = useState<FrameColor>("white");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [availableFrames, setAvailableFrames] = useState<APIFrame[]>([]);
  const [selectedCustomFrame, setSelectedCustomFrame] = useState<APIFrame | null>(null);
  const [loadingFrames, setLoadingFrames] = useState(false);

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

  const requiredPhotoCount = (() => {
    if (layout === "grid-2x3") return 6;
    if (layout === "single") return 1;
    return 4; 
  })();

  useEffect(() => {
    if (photos.length === 0) {
      navigate("/layout");
      return;
    }

    setLoadingFrames(true);
    fetch('http://localhost:3001/frames')
      .then(res => res.json())
      .then((data: APIFrame[]) => {
        const eligibleFrames = data.filter(frame => 
            frame.slots && frame.slots.length === requiredPhotoCount
        );
        setAvailableFrames(eligibleFrames);
      })
      .catch(err => console.error("Failed to load frames:", err))
      .finally(() => setLoadingFrames(false));

  }, [photos, navigate, requiredPhotoCount]);

  useEffect(() => {
    renderPhotoStrip();
  }, [photos, frameMode, frameColor, customColor, currentFilter, layout, selectedCustomFrame]);

  const renderPhotoStrip = async () => {
    if (!canvasRef.current || photos.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let CANVAS_WIDTH: number;
    let CANVAS_HEIGHT: number;
    let photoWidth: number;
    let photoHeight: number;
    let cols: number;
    let rows: number;
    
    const WATERMARK_HEIGHT = 60;
    const FRAME_PADDING = 40; 

    if (layout === "vertical-4") {
      CANVAS_WIDTH = 600;
      CANVAS_HEIGHT = 1800;
      cols = 1; rows = 4;
    } else if (layout === "horizontal-2x2") {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 2; rows = 2;
    } else if (layout === "grid-2x3") {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 2; rows = 3;
    } else {
      CANVAS_WIDTH = 1200;
      CANVAS_HEIGHT = 1800;
      cols = 1; rows = 1;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // ===============================================
    // MODE 1: SOLID COLOR (Default)
    // ===============================================
    if (frameMode === 'color' || !selectedCustomFrame) {
        if (layout === "vertical-4") {
            photoWidth = CANVAS_WIDTH - FRAME_PADDING * 2;
            photoHeight = (CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * (rows + 1)) / rows;
        } else if (layout === "horizontal-2x2" || layout === "grid-2x3") {
            photoWidth = (CANVAS_WIDTH - FRAME_PADDING * (cols + 1)) / cols;
            photoHeight = (CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * (rows + 1)) / rows;
        } else {
            photoWidth = CANVAS_WIDTH - FRAME_PADDING * 2;
            photoHeight = CANVAS_HEIGHT - WATERMARK_HEIGHT - FRAME_PADDING * 2;
        }

        const selectedFrameColor =
          frameColor === "custom"
            ? customColor
            : frameColors.find((f) => f.value === frameColor)?.color || "#ffffff";

        ctx.fillStyle = selectedFrameColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const photoPromises = photos.slice(0, requiredPhotoCount).map((photo, index) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              const x = FRAME_PADDING + col * (photoWidth + FRAME_PADDING);
              const y = FRAME_PADDING + row * (photoHeight + FRAME_PADDING);
              drawImageWithFilter(ctx, img, x, y, photoWidth, photoHeight, selectedFrameColor).then(resolve);
            };
            img.onerror = () => resolve();
            img.src = photo.dataUrl;
          });
        });
        await Promise.all(photoPromises);

        const watermarkY = canvas.height - 30;
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillStyle = "#666666";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("FotoRek!", canvas.width / 2, watermarkY);
    } 
    
    // ===============================================
    // MODE 2: CUSTOM FRAME (Teknik Sandwich/Layering)
    // ===============================================
    else {
        // --- LANGKAH 1: Siapkan Background Canvas ---
        // Kita beri warna putih dulu di paling belakang supaya kalau ada celah tidak transparan
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // --- LANGKAH 2: Load Gambar Frame (TAPI JANGAN GAMBAR DULU) ---
        const frameImg = new Image();
        const frameLoadedPromise = new Promise<void>((resolve) => {
            frameImg.onload = () => resolve();
            frameImg.onerror = () => resolve(); // Tetap lanjut meski error
            frameImg.src = selectedCustomFrame.bgImageData;
        });

        // --- LANGKAH 3: Gambar Foto DULUAN (Layer Tengah) ---
        // Foto akan digambar di atas kanvas putih, tapi di bawah Frame nanti.
        const photoPromises = photos.slice(0, requiredPhotoCount).map((photo, index) => {
            return new Promise<void>((resolve) => {
                const slot = selectedCustomFrame.slots[index];
                if (!slot) { resolve(); return; } 

                const img = new Image();
                img.onload = () => {
                    const x = slot.relativeX * CANVAS_WIDTH;
                    const y = slot.relativeY * CANVAS_HEIGHT;
                    const w = slot.relativeWidth * CANVAS_WIDTH;
                    const h = slot.relativeHeight * CANVAS_HEIGHT;

                    // Gambar foto
                    // Note: bgColor putih di sini hanya fallback
                    drawImageWithFilter(ctx, img, x, y, w, h, "#ffffff").then(resolve);
                };
                img.onerror = () => resolve();
                img.src = photo.dataUrl;
            });
        });

        // Tunggu semua foto selesai digambar
        await Promise.all(photoPromises);

        // --- LANGKAH 4: Gambar Frame PNG TERAKHIR (Layer Paling Atas) ---
        // Tunggu frame loading selesai
        await frameLoadedPromise;
        
        // Frame ditimpa di atas foto. Bagian transparan frame akan memperlihatkan foto di bawahnya.
        ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  };

  const drawImageWithFilter = async (
      ctx: CanvasRenderingContext2D, 
      img: HTMLImageElement, 
      x: number, y: number, w: number, h: number, 
      bgColor: string
  ) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      const imgAspect = img.width / img.height;
      const boxAspect = w / h;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > boxAspect) {
        drawHeight = h;
        drawWidth = drawHeight * imgAspect;
        drawX = (w - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = w;
        drawHeight = drawWidth / imgAspect;
        drawX = 0;
        drawY = (h - drawHeight) / 2;
      }

      tempCtx.fillStyle = bgColor;
      tempCtx.fillRect(0, 0, w, h);
      tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      if (currentFilter !== "none") {
        const imageData = tempCtx.getImageData(0, 0, w, h);
        const filtered = applyFilter(imageData, currentFilter);
        tempCtx.putImageData(filtered, 0, 0);
      }

      ctx.drawImage(tempCanvas, x, y, w, h);
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
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Customize Your Photos</h1>
            <p className="text-gray-500 text-sm md:text-base">Layout {layout} • {photos.length} photos captured</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-3xl p-8 flex items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto", maxHeight: "70vh", display: "block" }} />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black">
                    <span className="text-[10px] text-white font-semibold">Fx</span>
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                </div>
                <FilterPanel currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-gray-900" />
                  <h3 className="text-lg font-bold text-gray-900">Frame Style</h3>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    <button 
                        onClick={() => { setFrameMode('color'); setSelectedCustomFrame(null); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${frameMode === 'color' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Solid Color
                    </button>
                    <button 
                         onClick={() => setFrameMode('custom')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${frameMode === 'custom' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Custom Themes
                    </button>
                </div>

                {frameMode === 'color' && (
                    <>
                        <div className="flex flex-wrap gap-3">
                        {frameColors.map((frame) => (
                            <button
                            key={frame.value}
                            onClick={() => setFrameColor(frame.value)}
                            className={`w-7 h-7 rounded-full border-2 transition-all`}
                            style={{ backgroundColor: frame.color, borderColor: frameColor === frame.value ? "#000000" : "#e5e7eb", boxShadow: frameColor === frame.value ? "0 0 0 2px #00000033" : "none" }}
                            />
                        ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-500 font-semibold">Custom</span>
                            <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setFrameColor("custom"); }} className="w-10 h-8 rounded-md border border-gray-300 cursor-pointer" />
                        </div>
                    </>
                )}

                {frameMode === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {loadingFrames ? (
                            <div className="col-span-2 text-center py-4 text-gray-500 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading...</div>
                        ) : availableFrames.length === 0 ? (
                            <div className="col-span-2 text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                                <p className="text-sm text-gray-500">No frames found for {requiredPhotoCount} photos.</p>
                            </div>
                        ) : (
                            availableFrames.map(frame => (
                                <div 
                                    key={frame.id}
                                    onClick={() => setSelectedCustomFrame(frame)}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${selectedCustomFrame?.id === frame.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="aspect-[2/3] bg-gray-100">
                                        <img src={frame.bgImageData} alt={frame.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-xs truncate text-center">{frame.name}</div>
                                    {selectedCustomFrame?.id === frame.id && (
                                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-sm">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={downloadPhotoStrip} className="flex-1 bg-black hover:bg-gray-900 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm">Download</button>
                <button onClick={() => navigate("/booth", { state: { layout } })} className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3.5 px-6 rounded-xl border border-gray-300">Take New Photos</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};