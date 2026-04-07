import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import AuthModal from "@/components/AuthModal";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Plantity | Premium Food Ordering",
  description: "Order chef-crafted dishes delivered hot to your door.",
  icons: {
    icon: "/images/plantity-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${playfair.variable} antialiased`}
        style={{ background: "#0b0b0d", color: "#efe7d6" }}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
