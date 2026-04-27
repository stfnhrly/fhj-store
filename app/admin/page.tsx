'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SAMPLE_GAMES = [
  {
    id: "mobile-legends",
    name: "Mobile Legends: Bang Bang",
    publisher: "Moonton",
    coverImage: "https://picsum.photos/seed/mlbb/400/600",
    bannerImage: "https://picsum.photos/seed/mlbb-banner/1200/400",
    slug: "mobile-legends",
    requiresServerId: true,
  },
  {
    id: "free-fire",
    name: "Free Fire",
    publisher: "Garena",
    coverImage: "https://picsum.photos/seed/ff/400/600",
    bannerImage: "https://picsum.photos/seed/ff-banner/1200/400",
    slug: "free-fire",
    requiresServerId: false,
  },
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    publisher: "Tencent",
    coverImage: "https://picsum.photos/seed/pubg/400/600",
    bannerImage: "https://picsum.photos/seed/pubg-banner/1200/400",
    slug: "pubg-mobile",
    requiresServerId: false,
  }
];

const SAMPLE_PRODUCTS = [
  { id: "mlbb-id-1", gameId: "mobile-legends", name: "86 Diamonds", price: 23000, sortOrder: 1 },
  { id: "mlbb-id-2", gameId: "mobile-legends", name: "172 Diamonds", price: 46000, sortOrder: 2 },
  { id: "mlbb-id-3", gameId: "mobile-legends", name: "257 Diamonds", price: 69000, sortOrder: 3 },
  { id: "mlbb-id-4", gameId: "mobile-legends", name: "Weekly Diamond Pass", price: 28000, sortOrder: 0 },
  { id: "ff-id-1", gameId: "free-fire", name: "100 Diamonds", price: 16000, sortOrder: 1 },
  { id: "ff-id-2", gameId: "free-fire", name: "210 Diamonds", price: 32000, sortOrder: 2 },
  { id: "pubg-id-1", gameId: "pubg-mobile", name: "60 UC", price: 15000, sortOrder: 1 },
  { id: "pubg-id-2", gameId: "pubg-mobile", name: "325 UC", price: 75000, sortOrder: 2 },
];

export default function AdminPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const snap = await getDocs(collection(db, 'transactions'));
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.warn("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSeed = async () => {
    if(!confirm("Yakin ingin melakukan seed initial data ke Firestore?")) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      SAMPLE_GAMES.forEach(g => {
        const {id, ...data} = g;
        batch.set(doc(db, 'games', id), data);
      });
      SAMPLE_PRODUCTS.forEach(p => {
        const {id, ...data} = p;
        batch.set(doc(db, 'products', id), data);
      });
      await batch.commit();
      alert("Berhasil insert games dan products!");
    } catch(err) {
      alert("Error seeding data.");
    } finally {
      setSeeding(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
       await updateDoc(doc(db, 'transactions', id), {
         status: newStatus,
         updatedAt: new Date().toISOString()
       });
       fetchTransactions();
    } catch(e) {
      console.error(e);
      alert("Gagal update status");
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-50">Admin Dashboard</h1>
      
      <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 mb-8 rounded-r-xl">
        <h3 className="font-bold text-blue-400">Mode Simulasi</h3>
        <p className="text-sm text-blue-400/80 mt-1">
          Aplikasi berjalan dalam mode simulasi. Firebase Rules sudah disetting open (`true`) sehingga seeding dan update status bisa dilakukan langsung dari client frontend tanpa API rahasia.
        </p>
      </div>

      <div className="mb-8">
        <button 
          onClick={handleSeed} 
          disabled={seeding}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          {seeding ? 'Memproses...' : 'Seed Games & Products Data'}
        </button>
      </div>

      <div className="bg-slate-800 shadow-lg rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center text-slate-50">
          <h2 className="font-bold text-lg">Semua Transaksi</h2>
          <button onClick={fetchTransactions} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap text-slate-50">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">User ID</th>
                <th className="px-6 py-3 font-medium">Metode</th>
                <th className="px-6 py-3 font-medium">Harga</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center animate-pulse text-slate-400">Memuat...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Tidak ada data transaksi.</td></tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{txn.id}</td>
                    <td className="px-6 py-4 text-slate-100">{txn.gameUserIdentifier}</td>
                    <td className="px-6 py-4 capitalize text-slate-100">{txn.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-medium text-slate-100">Rp {txn.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        txn.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        txn.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => updateStatus(txn.id, 'PAID')} className="text-blue-400 font-medium text-xs hover:text-blue-300 hover:underline">Mark Paid</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
