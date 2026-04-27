import type {Metadata} from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'FHJ STORE - Top Up Game',
  description: 'FHJ STORE adalah website top up game cepat dan mudah (simulasi)',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${rajdhani.variable} bg-slate-900 text-slate-50 font-sans min-h-screen flex flex-col antialiased`}>
        <header className="sticky top-0 z-50 w-full bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
          <div className="container mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center h-[40px] sm:h-[50px] md:h-[60px] w-auto max-w-[180px]">
                 {/* Adding unoptimized just to be safe with external routing via NextImage if imgur redirects */}
                 <Image src="https://i.imgur.com/ZiyXj6M.png" alt="FHJ STORE Logo" width={180} height={60} unoptimized className="w-auto h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" priority />
              </div>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-display font-semibold uppercase tracking-widest text-slate-300">
              <Link href="/" className="hover:text-blue-400 transition-colors drop-shadow-sm">Home</Link>
              <Link href="/admin" className="hover:text-blue-400 transition-colors drop-shadow-sm">Admin</Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto max-w-6xl p-6 w-full">
          {children}
        </main>
        
        <footer className="mt-12 flex items-center justify-between px-6 py-6 border-t border-slate-700/50 text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest font-semibold container mx-auto max-w-6xl">
           <div>&copy; {new Date().getFullYear()} FHJ STORE • All rights reserved.</div>
          <div className="flex gap-4 sm:gap-6">
            <span className="hidden sm:inline hover:text-slate-300 transition-colors cursor-pointer">Terms</span>
            <span className="hidden sm:inline hover:text-slate-300 transition-colors cursor-pointer">Privacy</span>
            <span>Developed by AI Studio</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
