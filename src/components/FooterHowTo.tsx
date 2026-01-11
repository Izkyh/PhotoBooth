import { Instagram } from "lucide-react";
export const FooterHowTo = () => {
  const steps = [
    {
      number: '1',
      title: 'Pilih Layout',
      description:
        'Tekan "Start Photo Session" kemudian pilih layout yang kamu inginkan! Tekan "Next" untuk melanjutkan ke halaman selanjutnya.',
    },
    {
      number: '2',
      title: 'Ambil Foto',
      description:
        'Sistem akan memberikan waktu 3 detik untuk setiap pose dan mengambil foto secara berturut-turut. Tenang, kamu bisa retake kalau belum puas.',
    },
    {
      number: '3',
      title: 'Tambahkan Stiker dan Frame',
      description:
        'Setelah foto diambil, kamu bisa memilih warna frame dan menambahkan stiker agar hasil fotomu terlihat lebih fun!',
    },
    {
      number: '4',
      title: 'Unduh Foto',
      description:
        'Setelah proses selesai, pilih opsi "Download" untuk menyimpan fotomu! Jangan lupa tag kami di instagram @fotorek.id yaa!',
    },
  ];

  return (
    <>
      {/* How To Section - hitam */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Left */}
            <div className="flex flex-col justify-center">
              <h2 className="text-5xl font-black mb-8 leading-tight">
                Bagaimana<br />
                Cara<br />
                Menggunakan<br />
                Foto Rek!<br />
                Online?
              </h2>
            </div>

            {/* Right - steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="space-y-3">
                  <div className="text-5xl font-black text-gray-300">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer putih di bawah how-to */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm">
          {/* Contact us + IG icons */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">Contact Us</span>
            <div className="flex items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  "https://www.instagram.com/fotorek.id/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="w-7 h-7 rounded-full border border-white flex items-center justify-center"
            >
              <Instagram className="w-5.5 h-5.5" />
            </button>
          </div>
          </div>

          {/* Powered by */}
          <p className="text-gray-600 text-xs sm:text-sm text-right">
            Powered by <strong className="text-gray-900">Foto Rek!</strong> • Capture memories, share moments
          </p>
        </div>
      </footer>
    </>
  );
};
