'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Gamepad2 } from 'lucide-react';
import { HARDCODED_GAMES } from '../lib/local-data';

interface Game {
  id: string;
  name: string;
  publisher: string;
  coverImage: string;
  slug: string;
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const querySnapshot = await getDocs(collection(db, 'games'));
        let gamesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Game[];
        
        if (gamesList.length === 0) {
          gamesList = HARDCODED_GAMES as Game[];
        }
        setGames(gamesList);
      } catch (err) {
        console.error("Firebase error", err);
        setGames(HARDCODED_GAMES as Game[]);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-[240px] md:h-80 lg:h-96 group shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent z-10 w-full h-full"></div>
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-14 lg:p-16">
          <div className="mb-6 transform transition-transform duration-500 group-hover:scale-105 origin-left">
             <Image src="https://i.imgur.com/ZiyXj6M.png" alt="FHJ STORE Logo" width={220} height={90} unoptimized className="w-[160px] md:w-[220px] h-auto object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display uppercase tracking-[0.1em] font-extrabold mb-3 text-slate-50 drop-shadow-lg leading-tight">
            Top Up Cepat, <br className="hidden md:block" />
            <span className="text-blue-500">Main Tanpa Hambatan</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base lg:text-lg max-w-xl mb-4 font-medium leading-relaxed">
            Selamat datang di FHJ STORE. Bayar pakai QRIS, saldo langsung masuk detik itu juga! (Simulasi)
          </p>
        </div>
        <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-40 mix-blend-overlay"></div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-widest text-slate-50 drop-shadow-sm">
          Pilih Game
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[1,2,3,4,5].map(i => (
             <div key={i} className="animate-pulse bg-slate-800 border border-slate-700/50 rounded-2xl p-3 flex flex-col">
               <div className="bg-slate-700 rounded-xl aspect-square w-full shadow-sm mb-3"></div>
               <div className="bg-slate-700 h-4 w-3/4 rounded mt-1 mx-auto"></div>
             </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 border border-slate-700/50 rounded-3xl flex flex-col items-center justify-center">
          <Gamepad2 className="w-12 h-12 text-slate-500 mb-4" />
          <p className="text-slate-400 text-lg font-medium">Belum ada game tersedia.</p>
          <Link href="/admin" className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25">
            Masuk ke Admin untuk Seed Data
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-8">
          {games.map(game => (
            <Link 
              key={game.id} 
              href={`/game/${game.slug}`}
              className="group bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-[20px] p-4 flex flex-col items-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.3)]"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 flex-shrink-0 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] mb-4">
                <Image 
                  src={game.coverImage} 
                  alt={game.name}
                  fill
                  unoptimized
                  onError={(e) => { e.currentTarget.srcset = ''; e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400'; }}
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <h3 className="font-display font-extrabold text-base md:text-lg line-clamp-1 text-center text-slate-50 group-hover:text-blue-400 transition-colors uppercase tracking-widest w-full px-1">{game.name}</h3>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 text-center font-medium">{game.publisher}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

