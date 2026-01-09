import {
  Camera,
  Wand2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const OnlineHomepage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <img
          src="/src/assets/fotoreklogo.png"
          alt="FotoRek Logo"
          className="mx-auto w-64 h-auto mb-12"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              Auto Capture
            </h3>
            <p className="text-gray-500 text-sm">
              3-second countdown for perfect shots
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <Wand2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              Creative Filters
            </h3>
            <p className="text-gray-500 text-sm">
              Multiple filters to enhance your photos
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
            <Wand2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">
              Creative Filters
            </h3>
            <p className="text-gray-500 text-sm">
              Multiple filters to enhance your photos
            </p>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-white text-gray-900 font-bold px-8 py-4 rounded-full border border-blue-100 shadow-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => navigate("/layout")}
            className="bg-gradient-to-r from-blue-100 to-blue-300 text-white font-bold px-12 py-4 rounded-full shadow-md flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
