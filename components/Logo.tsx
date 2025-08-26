import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.jpg" alt="Shop From London" width={40} height={40} className="rounded-full" />
      <div className="font-bold text-lg"><span className="text-brand">SHOP</span> FROM <span className="text-brand-red">LONDON</span></div>
    </div>
  );
}
