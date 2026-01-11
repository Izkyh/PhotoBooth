import { Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-900 py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-white text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Contact Us</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  "https://www.instagram.com/fotorek.id/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="w-7 h-7 rounded-full border border-black flex items-center justify-center"
            >
              <Instagram className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-100 text-right">
          Powered by <strong className="text-white">Foto Rek!</strong> • Capture
          memories, share moments
        </p>
      </div>
    </footer>
  );
};
