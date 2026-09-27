import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JECC Student Q&A Portal",
  description: "Ask questions to the Junior Entreprise Centrale Casablanca team and receive official email responses.",
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
