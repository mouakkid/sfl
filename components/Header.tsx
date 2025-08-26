'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, ShoppingCart, LogOut } from 'lucide-react'
import { useMemo } from 'react'

// ✅ évite <motion.header> qui plante avec SWC
const MotionHeader = motion.header
const MotionDiv = motion.div

function NavItem({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  const pathname = usePathname()
  const active = useMemo(() => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }, [pathname, href])

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-2 rounded-2xl px-4 py-2 transition',
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70',
      ].join(' ')}
    >
      <span className="inline-flex">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export default function Header() {
  return (
    <MotionHeader
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      className="border-b bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between p-3 md:p-4">
        {/* Logo + titre */}
        <Link href="/" className="flex items-center gap-3 group">
          <MotionDiv whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="shrink-0">
            {/* IMPORTANT : le fichier doit exister dans /public */}
            <Image
              src="/logo.jpg"            // si tu utilises PNG, change en /logo.png
              alt="Shop From London"
              width={160}
              height={36}
              priority
            />
          </MotionDiv>
          <span className="sr-only">Shop From London</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <NavItem href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={18} />} />
          <NavItem href="/orders" label="Commandes" icon={<ShoppingCart size={18} />} />
        </nav>

        {/* Action (garde ton flux actuel) */}
        <div className="hidden md:block">
          <Link
            href="/login?redirect=/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </MotionHeader>
  )
}
