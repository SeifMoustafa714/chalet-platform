import './globals.css';
import { Header } from '../components/Header';

export const metadata = {
  title: 'Coastly — Chalets on Egypt\'s Coast',
  description: 'Verified chalets across the North Coast, Ain Sokhna, Marsa Matrouh and Sharm El Sheikh.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
