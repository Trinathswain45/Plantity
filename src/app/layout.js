import { Outfit, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import AuthModal from "@/components/AuthModal";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

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
        className={`${outfit.variable} ${sora.variable} antialiased`}
        style={{ background: "#0a0705", color: "#f5e6d3" }}
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
