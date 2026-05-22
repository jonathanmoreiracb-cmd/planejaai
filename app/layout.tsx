import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PlanejaAI - Planos de Ação e Estudos Inteligentes com IA",
  description:
    "Gere cronogramas, roteiros de estudos e planos de negócios personalizados em segundos com o poder do Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("font-sans scroll-smooth", inter.variable)}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
