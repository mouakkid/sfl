'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard');
    });
  }, [router]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form onSubmit={onLogin} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <input className="input w-full" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input w-full" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="bg-brand text-white rounded-xl px-4 py-2 w-full">{loading ? 'Connexion...' : 'Se connecter'}</button>
        <style jsx>{`.input{ @apply bg-white rounded-xl border px-3 py-2; }`}</style>
      </form>
    </div>
  );
}
