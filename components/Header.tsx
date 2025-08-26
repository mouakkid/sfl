'use client';
import { motion } from 'framer-motion';
import Nav from './Nav';
import Logo from './Logo';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Logo />
        </motion.div>
        <Nav />
        <button onClick={signOut} className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600">Logout</button>
      </div>
    </header>
  );
}
