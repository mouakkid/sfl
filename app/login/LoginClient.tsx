'use client'
import { useState } from 'react'
import { signInAction } from './actions'

export default function LoginClient({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form
        action={async (formData) => {
          const res = await signInAction(formData)
          if (res?.error) setError(res.error)
        }}
        className="w-full max-w-sm space-y-4"
      >
        <input type="hidden" name="redirect" value={redirectTo} />
        <input name="email" type="email" placeholder="Email" required className="border rounded w-full p-2" />
        <input name="password" type="password" placeholder="Mot de passe" required className="border rounded w-full p-2" />
        <button type="submit" className="w-full border rounded p-2">Se connecter</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  )
}
