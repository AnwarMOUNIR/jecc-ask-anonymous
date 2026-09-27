import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JECC Anonymous Q&A Portal",
  description: "Ask questions anonymously to the Junior Entreprise Centrale Casablanca team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
