'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { CheckCircle2, Clock, XCircle, ChevronLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  gameId: string;
  productId: string;
  gameUserIdentifier: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: string;
  createdAt: string;
  snapToken?: string;
}

export default function TransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [txn, setTxn] = useState<Transaction | null>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(id);
      if (local) return JSON.parse(local) as Transaction;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
     if (typeof window !== 'undefined' && localStorage.getItem(id)) {
        return false;
     }
     return true;
  });

  useEffect(() => {
    if (!id) return;

    // 2. Fallback timeout to ensure we never get stuck on loading
    const forceStopLoading = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // 3. Fire-and-forget sync to Firebase (if it works, it works)
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, 'transactions', id);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setTxn({ id: docSnap.id, ...docSnap.data() } as Transaction);
          setLoading(false);
          clearTimeout(forceStopLoading);
        }
      }, () => {
         // Fallback covered by timeout and local fetch
      });
    } catch(e) { /* Ignore */ }

    return () => {
      unsubscribe();
      clearTimeout(forceStopLoading);
    };
  }, [id]);

  if (loading) {
     return <div className="p-12 text-center text-slate-500 animate-pulse">Memuat data transaksi...</div>;
  }

  if (!txn) {
    return (
      <div className="container mx-auto max-w-lg p-8 text-center mt-12 bg-slate-800 border border-slate-700/50 rounded-3xl shadow-lg backdrop-blur-xl">
        <h1 className="text-2xl font-bold mb-4 text-slate-50">Transaksi Tidak Ditemukan</h1>
        <p className="text-slate-400 mb-6">Mungkin ID transaksi salah atau sudah dihapus dari simulasi.</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">Kembali ke Beranda</button>
      </div>
    );
  }

  const formatRupiah = (num: number) => {
    return "Rp" + num.toLocaleString('id-ID');
  };

  const renderStatusIcon = () => {
    switch (txn.status) {
      case 'PAID': return <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'FAILED': return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      default: return <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />;
    }
  };

  const statusText = {
    'PAID': 'Pembayaran Berhasil',
    'FAILED': 'Pembayaran Gagal / Dibatalkan',
    'PENDING': 'Menunggu Pembayaran'
  };

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <div className="bg-slate-800 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-700/50 overflow-hidden text-slate-50">
        {/* Header Status */}
        <div className="p-8 md:p-10 text-center border-b border-slate-700/50 relative overflow-hidden bg-slate-900/40">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            {renderStatusIcon()}
            <h1 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-[0.15em] text-slate-50 drop-shadow-md mb-3">
              {statusText[txn.status]}
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">
              Order ID: <span className="font-mono text-slate-300">{txn.id}</span>
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6 text-slate-100 font-display font-bold border-b border-slate-700/50 pb-4 uppercase tracking-widest text-lg">
            <FileText className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            Detail Pesanan
          </div>

          <div className="space-y-4 md:space-y-5 text-sm md:text-base">
             <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Waktu Order</span>
                <span className="font-bold text-slate-100">{new Date(txn.createdAt).toLocaleString('id-ID')}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">ID Player</span>
                <span className="font-bold text-slate-100">{txn.gameUserIdentifier}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Metode</span>
                <span className="font-bold text-slate-100 uppercase">{txn.paymentMethod.replace('_', ' ')}</span>
             </div>
             <div className="border-t border-slate-700/50 border-dashed mt-6 pt-6 flex justify-between items-end">
                <span className="text-slate-400 font-display font-extrabold uppercase tracking-widest">Total</span>
                <span className="font-display font-black text-blue-400 text-3xl tracking-wider drop-shadow-sm">{formatRupiah(txn.price)}</span>
             </div>
          </div>

          {/* Action */}
          <div className="mt-10 flex flex-col gap-4">
             {txn.status === 'PENDING' && (
               <div className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-400 text-center text-sm md:text-base py-4 md:py-5 rounded-2xl font-medium shadow-inner">
                 Harap selesaikan pembayaran sesuai metode yang dipilih.
               </div>
             )}
             
             <Link href="/" className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-50 py-4 rounded-xl font-display font-extrabold tracking-widest uppercase transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
                <ChevronLeft className="w-5 h-5 mb-0.5" />
                Kembali ke Beranda
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
