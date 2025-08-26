import './globals.css'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Shop From London' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-3">
              {/* IMPORTANT: place le fichier dans /public/logo.png */}
              <Image src="/logo.png" alt="Shop From London" width={36} height={36} priority />
              <span className="text-lg font-semibold">
                <span className="text-slate-800">SHOP FROM</span>{' '}
                <span className="text-red-600">LONDON</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link href="/dashboard" className="rounded px-3 py-1 hover:bg-slate-100">Dashboard</Link>
              <Link href="/orders" className="rounded px-3 py-1 hover:bg-slate-100">Commandes</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  )
}
