import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string; error?: string }
}) {
  const redirectTo =
    typeof searchParams?.redirect === 'string' && searchParams.redirect
      ? searchParams.redirect
      : '/dashboard'
  const errorMsg = typeof searchParams?.error === 'string' ? searchParams.error : ''

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Connexion</h1>

        {errorMsg && (
          <div className="text-sm p-3 rounded border border-red-300 bg-red-50 text-red-700">
            {decodeURIComponent(errorMsg)}
          </div>
        )}

        <form action={login} className="space-y-3">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded p-2"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border rounded p-2"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="w-full border rounded p-2 font-medium">
            Se connecter
          </button>
        </form>

        <p className="text-xs text-gray-500">
          Besoin d’un compte ? Créez-le depuis Supabase Users ou ajoutez une page /signup plus tard.
        </p>
      </div>
    </div>
  )
}
