import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthurium Studios",
  description: "Dashboard da plataforma B2B de geracao de videos por API.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
