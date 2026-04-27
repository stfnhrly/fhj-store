'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, setDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Image from 'next/image';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { Check, Info, ShieldCheck, Gamepad2, CreditCard, QrCode, Banknote, HelpCircle, Loader2, User, Globe, Mail, Smartphone } from 'lucide-react';

interface Game {
  id: string;
  name: string;
  publisher: string;
  bannerImage: string;
  coverImage: string;
  requiresServerId: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  promoLabel?: string;
  sortOrder: number;
}

export default function GameTopUpPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const formatRupiah = (num: number) => {
    // Memastikan format: Rp10.000 tanpa titik desimal di belakang
    return "Rp" + num.toLocaleString('id-ID');
  };

  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('qris');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulation Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'games'), where('slug', '==', slug));
        const snap = await getDocs(q);
        
        let gameData: Game | null = null;
        let pData: Product[] = [];

        if (!snap.empty) {
          gameData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Game;
          const prodQ = query(collection(db, 'products'), where('gameId', '==', gameData.id), orderBy('sortOrder', 'asc'));
          const prodSnap = await getDocs(prodQ);
          pData = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
        }

        if (!gameData || pData.length === 0) {
           throw new Error("No data from firebase");
        }
        
        setGame(gameData);
        setProducts(pData);
      } catch (err) {
        console.warn("Fallback to local data due to error or missing data");
        // Fallback to local data
        import('../../../lib/local-data').then(({ HARDCODED_GAMES, HARDCODED_PRODUCTS }) => {
           const fallbackGame = HARDCODED_GAMES.find(g => g.slug === slug);
           if (fallbackGame) {
             setGame(fallbackGame as unknown as Game);
             const fallbackProducts = HARDCODED_PRODUCTS.filter(p => p.gameId === fallbackGame.id);
             setProducts(fallbackProducts as unknown as Product[]);
           }
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleCheckout = async () => {
    setErrorMsg('');
    if (!game) return;
    if (!userId) {
      setErrorMsg('Masukkan User ID.');
      return;
    }
    if (game.requiresServerId && !serverId) {
      setErrorMsg('Masukkan Server ID.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg('Email tidak valid.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 9) {
      setErrorMsg('No. WhatsApp tidak valid.');
      return;
    }
    if (!selectedProductId || !selectedProduct) {
      setErrorMsg('Pilih nominal top up.');
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = game.requiresServerId ? `${userId} (${serverId})` : userId;

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const newTxnId = 'SIMULATION-' + Date.now();
      
      const sessionData = {
        id: newTxnId,
        userId: 'guest',
        gameId: game.id,
        productId: selectedProductId,
        gameUserIdentifier: identifier,
        price: selectedProduct.price,
        status: 'PENDING',
        paymentMethod: paymentMethod,
        midtransOrderId: newTxnId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Save Locally Immediately (100% guarantee it works)
      localStorage.setItem(newTxnId, JSON.stringify(sessionData));

      // 2. Fire and Forget to Firebase (No await, so it won't hang)
      try {
        setDoc(doc(db, 'transactions', newTxnId), sessionData).catch(() => {});
      } catch(e) {
        // Ignore firebase errors in simulation
      }

      // Small delay just for UI feeling
      await new Promise(r => setTimeout(r, 600));

      setPendingTransactionId(newTxnId);
      setShowPaymentModal(true);

    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan simulasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!pendingTransactionId) return;
    setIsSimulating(true);
    
    // Simulate network load or user scanning QR
    await new Promise(r => setTimeout(r, 2500));
    
    try {
      // 1. Update local storage to success FIRST
      const local = localStorage.getItem(pendingTransactionId);
      if(local) {
        const parsed = JSON.parse(local);
        parsed.status = 'PAID';
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(pendingTransactionId, JSON.stringify(parsed));
      }

      // 2. Fire and forget update Firebase (using setDoc with merge to avoid updateDoc hanging)
      try {
        setDoc(doc(db, 'transactions', pendingTransactionId), {
          status: 'PAID',
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch(e) {
        // Ignore
      }
      
      setPaymentSuccess(true);
      await new Promise(r => setTimeout(r, 1500));

      // Redirect to transaction success page
      router.push(`/transaction/${pendingTransactionId}`);
    } catch (err) {
      alert("Pembayaran gagal (Simulasi).");
      setIsSimulating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center animate-pulse text-white/50">Memuat data game...</div>;
  }

  if (!game) {
    return (
      <div className="container mx-auto p-8 text-center text-white/50">
        Game tidak ditemukan.
      </div>
    );
  }

  return (
    <>
      {/* Game Banner */}
      <div className="relative w-full h-48 md:h-72 lg:h-[350px] bg-slate-900 overflow-hidden rounded-[20px] mb-8 border border-slate-700/50 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)]">
        <Image 
          src={game.bannerImage} 
          alt={game.name} 
          fill 
          className="object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 ease-out hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex items-end gap-6 md:gap-8">
          <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-2xl md:rounded-[20px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.4)] border-2 border-slate-700/50 hidden sm:block group hover:border-blue-400 transition-colors bg-slate-800">
             <ImageWithFallback 
               src={game.coverImage} 
               fallbackSrc="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400"
               alt={game.name} 
               fill
               unoptimized
               className="object-contain p-2 md:p-3 drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="pb-2">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-widest text-slate-50 drop-shadow-lg mb-2">{game.name}</h1>
            <p className="text-blue-400 font-semibold text-sm md:text-base tracking-widest uppercase">{game.publisher}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:flex-[1.8] flex flex-col gap-8">
            
            {/* Step 1: User ID */}
            <section className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-[20px] p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] relative animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xl font-display font-extrabold uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-50">
                <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_5px_15px_rgba(59,130,246,0.3)] border border-blue-400/20">1</span>
                 Masukkan Data Akun
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <input 
                    type="text" 
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-800/50 outline-none text-slate-50 placeholder-slate-500 transition-all font-mono shadow-inner"
                    placeholder="Masukkan User ID"
                  />
                </div>
                {game.requiresServerId && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                      <Globe className="w-[18px] h-[18px]" />
                    </div>
                    <input 
                      type="text" 
                      value={serverId}
                      onChange={e => setServerId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-800/50 outline-none text-slate-50 placeholder-slate-500 transition-all font-mono shadow-inner"
                      placeholder="Masukkan Zone/Server ID"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-800/50 outline-none text-slate-50 placeholder-slate-500 transition-all shadow-inner"
                    placeholder="Alamat Email"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                    <Smartphone className="w-[18px] h-[18px]" />
                  </div>
                  <input 
                    type="tel" 
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-800/50 outline-none text-slate-50 placeholder-slate-500 transition-all font-mono shadow-inner"
                    placeholder="No. WhatsApp (08...)"
                  />
                </div>
              </div>

              <p className="flex items-start gap-2 mt-5 text-xs text-slate-400">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                Bukti pembayaran akan dikirimkan ke Email dan WhatsApp Anda secara instan.
              </p>
            </section>

            {/* Step 2: Select Topup */}
            <section className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-[20px] p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] relative animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-extrabold uppercase tracking-widest flex items-center gap-3 text-slate-50">
                  <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_5px_15px_rgba(59,130,246,0.3)] border border-blue-400/20">2</span>
                  Pilih Nominal Top Up
                </h3>
                <span className="text-xs bg-yellow-400/20 text-yellow-400 px-3 md:px-4 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse border border-yellow-400/30">
                  Promo Terbatas!
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {products.length === 0 && <p className="text-sm text-slate-400 col-span-full">Produk sedang tidak tersedia.</p>}
                {products.sort((a,b) => a.sortOrder - b.sortOrder).map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-out flex flex-col justify-between group ${
                      selectedProductId === p.id 
                        ? 'bg-blue-600/15 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-[1.02]' 
                        : p.promoLabel
                          ? 'bg-slate-800/60 backdrop-blur-md border border-yellow-500/40 hover:border-yellow-400 hover:shadow-[0_10px_20px_rgba(250,204,21,0.15)] hover:-translate-y-1'
                          : 'bg-slate-900 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-500 hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    {/* Promo Ribbon */}
                    {p.promoLabel && (
                      <div className="absolute top-0 right-0 z-10">
                        <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-1.5 rounded-bl-xl shadow-md ${
                          p.promoLabel.includes('Promo')
                             ? 'bg-gradient-to-r from-red-500 to-rose-600 text-slate-50'
                             : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                        }`}>
                           {p.promoLabel}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 md:p-5 pt-6 md:pt-8 flex flex-col h-full relative z-0">
                      <div className="text-sm font-bold text-slate-50 mb-3 pr-6 line-clamp-2 leading-snug group-hover:text-blue-200 transition-colors">{p.name}</div>
                      
                      <div className="mt-auto">
                        {p.originalPrice && (
                          <div className="text-xs text-slate-400 line-through mb-1 font-medium">
                            {formatRupiah(p.originalPrice)}
                          </div>
                        )}
                        <div className={`text-base md:text-lg font-extrabold tracking-wide ${selectedProductId === p.id ? 'text-blue-400 drop-shadow-sm' : p.promoLabel ? 'text-yellow-400' : 'text-blue-400 group-hover:text-blue-300'}`}>
                           {formatRupiah(p.price)}
                        </div>
                      </div>
                    </div>
                    {/* Active check icon indicator */}
                    {selectedProductId === p.id && (
                       <div className="absolute bottom-3 right-3 text-blue-400">
                          <Check className="w-5 h-5 shadow-sm" />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

             {/* Step 3: Select Payment */}
             <section className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-[20px] p-6 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] relative animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-xl font-display font-extrabold uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-50">
                <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-sm text-white font-bold shadow-[0_5px_15px_rgba(59,130,246,0.3)] border border-blue-400/20">3</span>
                Pilih Pembayaran
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { id: 'qris', name: 'QRIS', logo: 'https://i.imgur.com/xLcalLH.png' },
                  { id: 'gopay', name: 'GoPay', logo: 'https://i.imgur.com/bosAqjM.png' },
                  { id: 'ovo', name: 'OVO', logo: 'https://i.imgur.com/J6nBHKp.png' },
                  { id: 'dana', name: 'DANA', logo: 'https://i.imgur.com/D4Yb0qf.png' },
                  { id: 'shopeepay', name: 'ShopeePay', logo: 'https://i.imgur.com/COStBo9.png' },
                  { id: 'bca', name: 'BCA Virtual Account', logo: 'https://i.imgur.com/oRF37Yc.png' }
                ].map(method => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 ease-out border-2 relative overflow-hidden group ${
                      paymentMethod === method.id 
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_5px_20px_rgba(59,130,246,0.2)] scale-[1.02]' 
                        : 'bg-slate-900 border-slate-700/50 hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
                    )}
                    <div className="w-12 h-12 bg-white rounded-xl flex-shrink-0 relative flex items-center justify-center p-2 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                       <Image src={method.logo} alt={method.name} fill className="object-contain p-1.5" unoptimized referrerPolicy="no-referrer" />
                    </div>
                    <span className={`font-medium text-sm text-left leading-tight pr-5 ${paymentMethod === method.id ? 'text-blue-400 font-bold drop-shadow-sm' : 'text-slate-300 group-hover:text-slate-100'}`}>
                      {method.name}
                    </span>
                    {paymentMethod === method.id && (
                       <div className="absolute right-3 text-blue-400 opacity-80">
                         <Check className="w-4 h-4" />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:flex-1 lg:sticky lg:top-28">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-[20px] p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <h3 className="text-xl font-display font-extrabold uppercase tracking-widest mb-6 flex items-center gap-3 text-slate-50 relative z-10">
                <ShieldCheck className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                Ringkasan Pesanan
              </h3>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-slate-400 text-sm font-medium">Game</span>
                <span className="font-bold text-sm text-right text-slate-50">{game.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-slate-400 text-sm font-medium">Item</span>
                <span className="font-bold text-sm text-right text-slate-50">{selectedProduct?.name || '-'}</span>
              </div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <span className="text-slate-400 text-sm font-medium">Pembayaran</span>
                <span className="font-bold text-sm text-right text-slate-50 uppercase">{paymentMethod ? paymentMethod.replace('_', ' ') : '-'}</span>
              </div>
                
              <div className="border-t border-slate-700/50 border-dashed my-5 relative z-10"></div>

              <div className="flex justify-between items-end mb-8 mt-2 relative z-10 gap-4">
                <span className="font-display font-extrabold uppercase tracking-widest text-slate-400">Total Tagihan</span>
                <span className="font-display font-black text-blue-400 text-3xl xl:text-4xl tracking-tight drop-shadow-md text-right">
                  {selectedProduct ? formatRupiah(selectedProduct.price) : 'Rp0'}
                </span>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-sm mb-6 border border-red-500/20 flex items-start gap-2 shadow-sm animate-in fade-in relative z-10">
                   <Info className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-display font-extrabold text-lg xl:text-xl uppercase tracking-widest active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 relative z-10 overflow-hidden group ${
                  isSubmitting 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] border border-blue-400/30 hover:border-blue-300/50'
                }`}
              >
                {!isSubmitting && (
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                )}
                {isSubmitting ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /> MEMPROSES...</>
                ) : 'BAYAR SEKARANG'}
              </button>
            </div>
          </div>

        </div>

        {/* Dummy Payment Modal with Glassmorphism */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700/50 rounded-[24px] p-8 md:p-10 text-slate-50 w-full max-w-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                {paymentMethod === 'qris' || paymentMethod === 'gopay' ? (
                   <QrCode className="w-24 h-24 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                ) : (
                   <Banknote className="w-24 h-24 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                )}
              </div>
              
              <h3 className="text-2xl font-display font-extrabold uppercase tracking-widest mb-2 text-slate-50">Menunggu Pembayaran</h3>
              <p className="text-slate-400 text-sm md:text-base mb-8">Total Tagihan: <span className="font-display font-bold text-blue-400 text-xl md:text-2xl ml-1">{selectedProduct && formatRupiah(selectedProduct.price)}</span></p>

              <button 
                onClick={handleSimulatePayment} 
                disabled={isSimulating || paymentSuccess} 
                className={`w-full py-4 rounded-xl font-display font-extrabold text-sm md:text-base uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
                  paymentSuccess 
                    ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-[1.02]'
                    : isSimulating 
                      ? 'bg-slate-700 text-slate-400 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] active:scale-[0.98]'
                }`}
              >
                {isSimulating && !paymentSuccess && <Loader2 className="w-5 h-5 animate-spin" />}
                {paymentSuccess && <Check className="w-6 h-6 text-white drop-shadow-sm" />}
                {paymentSuccess ? "PEMBAYARAN BERHASIL" : isSimulating ? "MEMPROSES PEMBAYARAN..." : "SIMULASIKAN PEMBAYARAN"}
              </button>

              {!isSimulating && (
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors py-2 px-4 rounded-lg hover:bg-slate-700/50"
                >
                  Batalkan Transaksi
                </button>
              )}
            </div>
          </div>
        )}
    </>
  );
}
