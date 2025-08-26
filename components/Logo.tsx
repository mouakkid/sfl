// components/Logo.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* Chemin absolu car le fichier est dans /public */}
      <Image
        src="/logo.png"
        alt="Shop From London"
        width={160}
        height={36}
        priority
      />
      <span className="sr-only">Shop From London</span>
    </Link>
  )
}
