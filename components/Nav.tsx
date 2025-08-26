'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Commandes' }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-4">
      {items.map(it => (
        <Link key={it.href} href={it.href}
          className={`px-4 py-2 rounded-xl transition-all ${pathname?.startsWith(it.href) ? 'bg-brand text-white' : 'bg-white hover:bg-gray-100'}`}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
