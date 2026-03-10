import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "StyleSense | AI Hair Styling Recommendations",
  description:
    "Upload your photo and get personalized AI-powered hairstyle recommendations tailored to your face shape, hair type, and lifestyle.",
  keywords: ["hair styling", "hairstyle recommendations", "AI hair analysis", "hair care"],
  openGraph: {
    title: "StyleSense | AI Hair Styling Recommendations",
    description:
      "Personalized hairstyle recommendations powered by AI. Upload your photo and discover styles that work for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
