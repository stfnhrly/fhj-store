export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-50 bg-slate-900">
      <h2 className="text-4xl font-bold mb-4">404 - Tidak Ditemukan</h2>
      <p className="text-slate-400 mb-8">Halaman yang Anda cari tidak ada.</p>
      <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
        Kembali ke Beranda
      </a>
    </div>
  )
}
