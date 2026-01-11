import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { FooterHowTo } from "../components/FooterHowTo";

export const LayoutSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLayout, setSelectedLayout] = useState<
    "vertical-4" | "horizontal-2x2" | "single" | "grid-2x3"
  >("vertical-4");

  const layouts = [
    {
      id: "vertical-4" as const,
      name: "Layout A",
      description: "4 Vertical Poses",
      preview: "4 Photos",
      cols: 1,
      rows: 4,
    },
    {
      id: "horizontal-2x2" as const,
      name: "Layout B",
      description: "2x2 Grid",
      preview: "4 Photos",
      cols: 2,
      rows: 2,
    },
    {
      id: "grid-2x3" as const,
      name: "Layout C",
      description: "2x3 Grid (Vertical)",
      preview: "6 Photos",
      cols: 2,
      rows: 3,
    },
    {
      id: "single" as const,
      name: "Layout D",
      description: "Single Photo",
      preview: "1 Photo",
      cols: 1,
      rows: 1,
    },
  ];

  const handleContinue = () => {
    navigate("/booth", { state: { layout: selectedLayout } });
  };

  const renderGridPreview = (layout: (typeof layouts)[0]) => {
    const totalPhotos = layout.rows * layout.cols;
    const items = Array.from({ length: totalPhotos }, (_, i) => i + 1);

    return (
      <div
        className="grid gap-1 bg-white rounded-xl p-2 border border-gray-300"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          width:
            layout.cols === 1 ? "50px" : layout.cols === 2 ? "80px" : "90px",
          height:
            layout.rows === 1 ? "90px" : layout.rows === 2 ? "110px" : "140px",
        }}
      >
        {items.map((num) => (
          <div
            key={num}
            className="bg-black rounded-[4px] flex items-center justify-center text-[10px] font-semibold text-white"
          >
            {num}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-start justify-center px-4 mt-24 mb-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Choose Your Layout
            </h1>
            <p className="text-base text-gray-600">
              Select the perfect layout for your photo session
            </p>
          </div>

          {/* Layout cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`relative bg-white rounded-3xl p-6 border-2 transition-all text-center ${
                  selectedLayout === layout.id
                    ? "border-black shadow-lg"
                    : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                }`}
              >
                <div className="mb-4 flex items-center justify-center">
                  {renderGridPreview(layout)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {layout.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {layout.description}
                </p>
                <p className="text-xs text-blue-600 font-semibold">
                  {layout.preview}
                </p>

                {selectedLayout === layout.id && (
                  <div className="absolute -top-3 -right-3 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Bottom buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3 rounded-full border border-gray-300 flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleContinue}
              className="bg-black hover:bg-gray-900 text-white font-semibold px-10 py-3 rounded-full flex items-center gap-2 text-sm shadow-sm"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <FooterHowTo />
    </div>
  );
};
