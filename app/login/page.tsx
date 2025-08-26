'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { signInAction } from './actions'

export default function LoginPage() {
  const params = useSearchParams()
  const redirectTo = params.get('redirect') || '/dashboard'
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form
        action={async (formData) => {
          const res = await signInAction(formData)
          if (res?.error) setError(res.error)
          // sinon redirect effectué côté serveur
        }}
        className="w-full max-w-sm space-y-4"
      >
        <input type="hidden" name="redirect" value={redirectTo} />
        <input name="email" type="email" required placeholder="Email" className="border rounded w-full p-2" />
        <input name="password" type="password" required placeholder="Mot de passe" className="border rounded w-full p-2" />
        <button type="submit" className="w-full border rounded p-2">Se connecter</button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  )
}
