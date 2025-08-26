'use client'

import { useState, useTransition } from 'react'
import { signInAction } from './actions'

export default function LoginClient({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(fd) => {
        setError(null)
        fd.set('redirect', redirectTo || '/dashboard')
        startTransition(async () => {
          // on appelle l'action serveur et on gère une éventuelle erreur
          const res = await signInAction(fd) as any
          if (res?.ok === false) setError(res.message ?? 'Erreur de connexion')
          // sinon redirect() a déjà navigué
        })
      }}
      className="mx-auto max-w-md space-y-4 p-6"
    >
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        required
        className="w-full rounded border px-3 py-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
