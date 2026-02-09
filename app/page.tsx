import { HeroOption9 } from "@/components/hero-options/hero-option-9";
import { Header } from "@/components/Header";
import { TrustedByModern } from "@/components/landing/TrustedByModern";
import { ProductCategoriesModern } from "@/components/landing/ProductCategoriesModern";
import { WhyChooseUsModern } from "@/components/landing/WhyChooseUsModern";
import { FeaturedProductsModern } from "@/components/landing/FeaturedProductsModern";
import { IndustriesModern } from "@/components/landing/IndustriesModern";
import { ProcessModern } from "@/components/landing/ProcessModern";
import { AboutSnapshot } from "@/components/landing/AboutSnapshot";
import { EnquiryForm } from "@/components/landing/EnquiryForm";
import { CtaModern } from "@/components/landing/CtaModern";
import { FooterModern } from "@/components/landing/FooterModern";



export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-100 selection:text-red-900 font-sans">
      <Header />
      <main className="flex flex-col w-full overflow-hidden">
        {/* 1. Hero Section */}
        <HeroOption9 />

        {/* 2. Brand Trust / Partners */}
        <TrustedByModern />

        {/* 3. Product Categories */}
        <ProductCategoriesModern />

        {/* 4. Why Choose Us */}
        <WhyChooseUsModern />

        {/* 5. Featured Products */}
        <FeaturedProductsModern />

        {/* 6. Industries We Serve */}
        <IndustriesModern />

        {/* 7. How It Works */}
        <ProcessModern />

        {/* 8. Call To Action Banner */}
        <CtaModern />

        {/* 9. About Snapshot */}
        <AboutSnapshot />

        {/* 10. Contact / Enquiry Section */}
        <EnquiryForm />
      </main>
      
      {/* 11. Footer */}
      <FooterModern />
    </div>
  );
}
