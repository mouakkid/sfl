import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'SHOP FROM LONDON',
  description: 'Gestion commandes & achats',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
