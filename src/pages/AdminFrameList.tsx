import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Pastikan file ini ada di folder public
const samples_MODEL_IMAGE = '/samples/model-1.jpg'; 
const DEFAULT_FRAME_PLACEHOLDER = '/samples/default-frame.png';

// Tipe data untuk LIST (Ringkas, dipakai di Card)
interface FrameListItem {
  id: number;
  name: string;
  thumbnailUrl: string;
  slotCount: string; 
}

// Tipe data untuk DETAIL (Lengkap, dipakai di Preview Modal)
interface FrameDetail {
  id: number;
  name: string;
  bgImageData: string; // Gambar asli (High Res)
  slots: {
    relativeX: number;
    relativeY: number;
    relativeWidth: number;
    relativeHeight: number;
  }[];
}

export const AdminFrameList = () => {
  const navigate = useNavigate();
  
  // State untuk List Utama
  const [frames, setFrames] = useState<FrameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Modal Preview
  const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<FrameDetail | null>(null); 
  const [loadingPreview, setLoadingPreview] = useState(false);

  // 1. Fetch List Frames (Data Ringkas untuk Card)
  const fetchFrames = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:3001/frames')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setFrames(data))
      .catch(err => {
        console.error("Failed to fetch frames:", err);
        setError("Could not load frames. Make sure the server is running.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  // 2. Logic Buka Preview (Fetch Detail Koordinat Slot)
  const handleOpenPreview = (id: number) => {
    setSelectedFrameId(id);
    setLoadingPreview(true);
    setPreviewData(null); // Reset preview sebelumnya

    fetch(`http://localhost:3001/frames/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load detail');
        return res.json();
      })
      .then((data) => {
        setPreviewData(data); // Simpan data detail
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingPreview(false));
  };

  const handleClosePreview = () => {
    setSelectedFrameId(null);
    setPreviewData(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to delete this frame?')) {
      try {
        const response = await fetch(`http://localhost:3001/frames/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete frame');
        setFrames(frames.filter(f => f.id !== id));
        alert('Frame deleted successfully.');
      } catch (err) {
        console.error("Error deleting frame:", err);
        alert('An error occurred while deleting the frame.');
      }
    }
  };
  
  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    navigate(`/admin/frames/edit/${id}`);
  };

  return (
    <>
      {/* Main Page Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Frame Manager</h1>
            <p className="text-gray-500">Manage your photobooth templates</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchFrames} disabled={loading} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => navigate('/admin/frames/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
              <Plus className="w-5 h-5" /> Add New Frame
            </button>
          </div>
        </div>

        {/* Content List: CARD GRID VIEW (Seperti yang kamu suka) */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-500 h-10 w-10" /></div>
        ) : error ? (
           <div className="text-center py-20 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>
        ) : frames.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-xl">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300"/>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">No Frames Found</h3>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {frames.map((frame) => (
                <div 
                  key={frame.id}
                  onClick={() => handleOpenPreview(frame.id)} // Keep the handleOpenPreview
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex"
                >
                  {/* Preview Image */}
                  <div className="w-32 h-48 bg-gray-100 flex-shrink-0 relative">
                    <img 
                      src={frame.thumbnailUrl || DEFAULT_FRAME_PLACEHOLDER} 
                      alt={frame.name} 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-2xl">
                      {frame.slotCount}
                    </div>
                  </div>

                  {/* Details & Actions */}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900">{frame.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>{frame.slotCount} Photo Slots</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                       <button 
                        onClick={(e) => handleEdit(e, frame.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5"
                        title="Edit Frame"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, frame.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-semibold flex items-center gap-1.5"
                        title="Delete Frame"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

      {/* --- MODAL PREVIEW DETAIL (Logic Layering yang Benar) --- */}
      {selectedFrameId && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={handleClosePreview}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-xl text-gray-800">
                 {loadingPreview ? 'Loading...' : previewData?.name}
              </h2>
              <button onClick={handleClosePreview} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Content Modal: LIVE PREVIEW */}
            <div className="p-6 bg-gray-100 flex-1 overflow-auto flex items-center justify-center">
               {loadingPreview ? (
                  <Loader className="animate-spin text-blue-500 w-10 h-10" />
               ) : previewData ? (
                  
                  // Container Relative agar slot (absolute) posisinya mengacu ke sini
                  <div className="relative shadow-2xl bg-white inline-block">
                    
                    {/* LAYER 1 (BAWAH): Background Frame */}
                    <img 
                        src={previewData.bgImageData} 
                        alt="Background" 
                        className="max-w-full max-h-[60vh] w-auto h-auto block" 
                    />

                    {/* LAYER 2 (ATAS): Slot Foto */}
                    {previewData.slots.map((slot, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                left: `${slot.relativeX * 100}%`,
                                top: `${slot.relativeY * 100}%`,
                                width: `${slot.relativeWidth * 100}%`,
                                height: `${slot.relativeHeight * 100}%`,
                                zIndex: 10, // Di atas frame
                                overflow: 'hidden'
                            }}
                        >
                            <img 
                                src={samples_MODEL_IMAGE} 
                                alt={`Slot ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover', // Foto model full fill kotak
                                }}
                            />
                        </div>
                    ))}
                  </div>

               ) : (
                   <p className="text-red-500">Failed to load preview data.</p>
               )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500">
                This is a real-time preview using your configured slots.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};