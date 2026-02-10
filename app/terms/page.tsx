import { Header } from "@/components/Header";
import { FooterModern } from "@/components/landing/FooterModern";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Dhomec Solutions",
  description: "Read our terms and conditions for using Dhomec Solutions products and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-slate-500 mt-3">Last updated: February 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:font-semibold">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Dhomec Solutions (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms and Conditions
              govern your use of our website and services located at dhomec.com (the &quot;Service&quot;).
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree
              with any part of the terms, you may not access the Service.
            </p>

            <h2>2. Products and Services</h2>
            <p>
              Dhomec Solutions offers industrial automation products including but not limited to boom barriers,
              gate automation systems, door automation, traffic control equipment, and related accessories.
            </p>
            <ul>
              <li>Product images are for illustration purposes and may vary from the actual product.</li>
              <li>Prices are subject to change without prior notice.</li>
              <li>Products are subject to availability.</li>
              <li>We reserve the right to limit quantities on any orders.</li>
            </ul>

            <h2>3. Orders and Payments</h2>
            <p>
              When you place an order through our platform, you are making an offer to purchase the products
              listed. All orders are subject to acceptance by us.
            </p>
            <ul>
              <li>Payment is processed securely through Razorpay payment gateway.</li>
              <li>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
              <li>Consultation-based products may require a site visit and custom quotation before purchase.</li>
            </ul>

            <h2>4. Shipping and Delivery</h2>
            <p>
              Delivery timelines vary based on product type and location. Estimated delivery dates are
              provided at checkout and are not guaranteed.
            </p>
            <ul>
              <li>Standard delivery typically takes 7-15 business days.</li>
              <li>Heavy machinery and custom installations may take longer.</li>
              <li>Shipping charges are calculated based on weight, dimensions, and delivery location.</li>
            </ul>

            <h2>5. Returns and Refunds</h2>
            <p>
              Please refer to our <a href="/return-policy">Return &amp; Refund Policy</a> for detailed information
              on returns, exchanges, and refunds.
            </p>

            <h2>6. Warranty</h2>
            <p>
              All products carry manufacturer warranty as specified in the product documentation.
              Warranty claims should be initiated through our support ticket system.
            </p>

            <h2>7. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on this website including text, graphics, logos, images, and software is the
              property of Dhomec Solutions and is protected by Indian and international copyright laws.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Dhomec Solutions shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of our services.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: info@dhomec.com</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterModern />
    </div>
  );
}
