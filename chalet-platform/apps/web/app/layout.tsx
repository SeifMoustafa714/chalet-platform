import './globals.css';

export const metadata = {
  title: 'Chalet Booking Egypt',
  description: 'Book verified chalets across North Coast, Ain Sokhna, Marsa Matrouh and Sharm El Sheikh.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white px-6 py-4">
          <a href="/" className="text-xl font-semibold">Chalet<span className="text-sky-600">EG</span></a>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
