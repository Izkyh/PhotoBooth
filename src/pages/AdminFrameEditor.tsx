import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Tipe Data Slot (Pixel-based untuk state RND)
interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Tipe Data Slot (Relative untuk API)
interface RelativePhotoSlot {
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
}

// Komponen Kecil untuk Handle Resize (Kotak Putih Biru)
const ResizeHandle = () => (
  <div className="w-3 h-3 bg-white border-2 border-blue-600 rounded-full shadow-sm" />
);

export const AdminFrameEditor = () => {
  const navigate = useNavigate();
  const { id: frameId } = useParams();
  const isEditing = Boolean(frameId);

  const [frameName, setFrameName] = useState("");
  const [bgImageData, setBgImageData] = useState<string | null>(null);
  const [bgImageDimensions, setBgImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [slots, setSlots] = useState<PhotoSlot[]>([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewScale, setViewScale] = useState(1);

  // Fetch data jika mode edit
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      fetch(`http://localhost:3001/frames/${frameId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFrameName(data.name);
            setBgImageData(data.bgImageData);

            const img = new Image();
            img.onload = () => {
              const naturalWidth = img.naturalWidth;
              const naturalHeight = img.naturalHeight;
              setBgImageDimensions({
                width: naturalWidth,
                height: naturalHeight,
              });

              const pixelSlots = data.slots.map(
                (s: RelativePhotoSlot, i: number) => ({
                  id: `slot-${Date.now()}-${i}`,
                  x: s.relativeX * naturalWidth,
                  y: s.relativeY * naturalHeight,
                  width: s.relativeWidth * naturalWidth,
                  height: s.relativeHeight * naturalHeight,
                })
              );
              setSlots(pixelSlots);
              setLoading(false);
            };
            img.src = data.bgImageData;
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to load frame data");
          setLoading(false);
        });
    }
  }, [frameId, isEditing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target?.result as string;
        setBgImageData(imgData);

        const img = new Image();
        img.onload = () => {
          setBgImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = imgData;
      };
      reader.readAsDataURL(file);
    }
  };

  const addSlot = () => {
    const defaultWidth = bgImageDimensions.width * 0.3; // 30% width
    const defaultHeight = defaultWidth / 1.5;

    const newSlot: PhotoSlot = {
      id: `slot-${Date.now()}`,
      x: (bgImageDimensions.width - defaultWidth) / 2,
      y: (bgImageDimensions.height - defaultHeight) / 2,
      width: defaultWidth,
      height: defaultHeight,
    };
    setSlots([...slots, newSlot]);
  };

  const updateSlot = (id: string, data: Partial<PhotoSlot>) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!frameName || !bgImageData) {
      alert("Please provide a frame name and a background image.");
      return;
    }
    setSaving(true);

    const relativeSlots = slots.map((s) => ({
      relativeX: s.x / bgImageDimensions.width,
      relativeY: s.y / bgImageDimensions.height,
      relativeWidth: s.width / bgImageDimensions.width,
      relativeHeight: s.height / bgImageDimensions.height,
    }));

    const payload = {
      name: frameName,
      bgImageData: bgImageData,
      slots: relativeSlots,
    };

    const url = isEditing
      ? `http://localhost:3001/frames/${frameId}`
      : "http://localhost:3001/frames";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert(`Frame successfully ${isEditing ? "updated" : "saved"}!`);
      navigate("/admin/frames");
    } catch (error) {
      console.error("Failed to save frame:", error);
      alert("An error occurred while saving. Check the console.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (bgImageDimensions.width > 0 && canvasRef.current) {
      const padding = 80;
      const containerWidth = canvasRef.current.clientWidth - padding;
      const containerHeight = canvasRef.current.clientHeight - padding;

      const scaleX = containerWidth / bgImageDimensions.width;
      const scaleY = containerHeight / bgImageDimensions.height;

      const newScale = Math.min(scaleX, scaleY, 1);
      setViewScale(newScale);
    }
  }, [
    bgImageDimensions,
    canvasRef.current?.clientWidth,
    canvasRef.current?.clientHeight,
  ]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen">
      {/* Header Toolbar */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-xl">
              {isEditing ? "Edit Frame" : "Create New Frame"}
            </h1>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Enter Frame Name"
            className="border rounded-lg px-3 py-2 text-sm w-64"
            value={frameName}
            onChange={(e) => setFrameName(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Frame"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto flex-shrink-0">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Frame Background
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative aspect-video flex items-center justify-center">
              <input
                type="file"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/png, image/jpeg"
              />
              {bgImageData ? (
                <img
                  src={bgImageData}
                  alt="Background Preview"
                  className="max-w-full max-h-full object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span>Click to upload</span>
                  <span className="text-xs">PNG or JPG</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">
                Photo Slots ({slots.length})
              </h3>
              <button
                onClick={addSlot}
                disabled={!bgImageData}
                className="text-blue-600 disabled:text-gray-400 text-sm font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div
                  key={slot.id}
                  className="bg-gray-50 p-3 rounded-lg border text-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">
                      Photo Slot #{i + 1}
                    </span>
                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {slots.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No slots added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Canvas Area */}
        <div
          className="flex-1 bg-gray-200 overflow-hidden relative"
          ref={canvasRef}
        >
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : bgImageData ? (
            <div
              style={{
                width: bgImageDimensions.width,
                height: bgImageDimensions.height,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${viewScale})`,
                transformOrigin: "center center",
                boxShadow: "0 0 20px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={bgImageData}
                alt="Frame Background"
                style={{
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />

              {slots.map((slot, i) => (
                <Rnd
                  key={slot.id}
                  size={{ width: slot.width, height: slot.height }}
                  position={{ x: slot.x, y: slot.y }}
                  onDragStop={(_e, d) => {
                    updateSlot(slot.id, { x: d.x, y: d.y });
                  }}
                  onResizeStop={(_e, _direction, ref, _delta, position) => {
                    updateSlot(slot.id, {
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      ...position,
                    });
                  }}
                  bounds="parent"
                  scale={viewScale}
                  // VISUAL HELPER: Menambahkan handle kustom di pojok & tengah
                  resizeHandleComponent={{
                    bottomRight: <ResizeHandle />,
                    bottomLeft: <ResizeHandle />,
                    topRight: <ResizeHandle />,
                    topLeft: <ResizeHandle />,
                    top: <ResizeHandle />,
                    bottom: <ResizeHandle />,
                    left: <ResizeHandle />,
                    right: <ResizeHandle />,
                  }}
                  className="group border-2 border-dashed border-blue-500 bg-blue-500/30 flex items-center justify-center hover:bg-blue-500/40 transition-colors"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span
                      className="font-black text-white drop-shadow-md select-none"
                      style={{
                        // UKURAN FONT: 25% dari tinggi slot
                        fontSize: `${Math.max(14, slot.height * 0.25)}px`,
                        lineHeight: 1,
                      }}
                    >
                      {i + 1}
                    </span>

                    <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(slot.width)} x {Math.round(slot.height)}
                    </span>
                  </div>
                </Rnd>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center text-gray-500">
              <p>Please upload a background image to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};