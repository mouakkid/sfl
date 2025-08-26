import { signInAction } from './actions'

export default function Page({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectTo = searchParams?.redirect?.length ? searchParams.redirect! : '/dashboard'

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form action={signInAction} className="w-full max-w-sm space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <input name="email" type="email" required placeholder="Email" className="border rounded w-full p-2" />
        <input name="password" type="password" required placeholder="Mot de passe" className="border rounded w-full p-2" />
        <button type="submit" className="w-full border rounded p-2">Se connecter</button>
      </form>
    </div>
  )
}
