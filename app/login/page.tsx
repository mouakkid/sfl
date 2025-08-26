import LoginClient from './LoginClient'

export default function Page({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectTo = searchParams?.redirect || '/dashboard'
  return (
    <div className="min-h-[60vh] flex items-start justify-center">
      <LoginClient redirectTo={redirectTo} />
    </div>
  )
}
