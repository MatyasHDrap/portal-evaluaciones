import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";

export const metadata: Metadata = {
  title: "Portal de Evaluaciones | Gestión Académica",
  description: "Plataforma para gestionar evaluaciones, asignaturas y calificaciones estudiantiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <ThemeScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
