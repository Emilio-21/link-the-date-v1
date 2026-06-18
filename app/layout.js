// app/layout.js
import "./globals.css";
import { Cinzel, Pinyon_Script, Cormorant_Garamond, Manrope } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
});

// Fuentes del dashboard (look "Olivos"): serif elegante + sans moderna
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Link The Date - Crea y comparte tus eventos",
  description: "Plataforma para crear eventos importantes y compartirlos con invitados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${cinzel.variable} ${pinyon.variable} ${cormorant.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}