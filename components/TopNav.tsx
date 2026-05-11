'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TopNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Berhasil logout');
      router.push('/');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  if (loading) {
    return <div className="w-24 h-8 bg-slate-800/50 animate-pulse rounded-lg"></div>;
  }

  return (
    <nav className="flex items-center gap-6 text-sm font-display font-semibold uppercase tracking-widest text-slate-300">
      <Link href="/" className="hover:text-blue-400 transition-colors drop-shadow-sm">Home</Link>
      <Link href="/admin" className="hover:text-blue-400 transition-colors drop-shadow-sm">Admin</Link>
      
      {user ? (
        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
              <UserIcon className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-slate-200 hidden sm:inline-block">
              {user.displayName || user.email?.split('@')[0]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 ml-2">
          <Link href="/login" className="px-4 py-2 hover:text-blue-400 transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors border border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
