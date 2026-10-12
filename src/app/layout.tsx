import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centrale Tech — laundry.fecc.ma Hub des Anomalies & Pannes',
  description:
    'Portail officiel de signalement et de résolution des pannes et anomalies de laundry.fecc.ma, conçu et maintenu par Centrale Tech (École Centrale Casablanca).',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700;800&family=Outfit:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#07181c] text-slate-100 min-h-screen selection:bg-[#009881] selection:text-white">
        {children}
      </body>
    </html>
  );
}
