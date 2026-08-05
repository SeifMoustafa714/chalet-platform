import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata = {
  title: 'Coastly — Chalets on Egypt\'s Coast',
  description: 'Verified chalets across the North Coast, Ain Sokhna, Marsa Matrouh and Sharm El Sheikh.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
