import LoginClient from './LoginClient'

export default function Page({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const redirectTo =
    typeof searchParams?.redirect === 'string' && searchParams.redirect.length > 0
      ? searchParams.redirect
      : '/dashboard'

  return <LoginClient redirectTo={redirectTo} />
}
