import { Header } from "@/components/Header";
import { FooterModern } from "@/components/landing/FooterModern";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Dhomec Solutions",
  description: "Learn about our return, exchange, and refund policies for products purchased from Dhomec Solutions.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Return &amp; Refund Policy</h1>
            <p className="text-slate-500 mt-3">Last updated: February 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:font-semibold">
            <h2>1. Return Eligibility</h2>
            <p>Products may be returned within <strong>7 days</strong> of delivery, subject to the following conditions:</p>
            <ul>
              <li>The product must be unused and in its original packaging.</li>
              <li>The product must not be damaged due to misuse or improper handling.</li>
              <li>Custom-built or made-to-order products are <strong>not eligible</strong> for return.</li>
              <li>Products purchased after consultation/site-visit are returnable only if they are defective.</li>
            </ul>

            <h2>2. How to Initiate a Return</h2>
            <ol>
              <li>Log in to your account and go to <strong>Dashboard → Orders</strong>.</li>
              <li>Select the order you wish to return and click &quot;Request Return&quot;.</li>
              <li>Provide the reason for return and submit your request.</li>
              <li>Our team will review and respond within <strong>2 business days</strong>.</li>
              <li>Once approved, a pickup will be scheduled or instructions will be provided.</li>
            </ol>

            <h2>3. Return Shipping</h2>
            <ul>
              <li>For defective or damaged products, return shipping is <strong>free</strong>.</li>
              <li>For change-of-mind returns, the customer bears the return shipping cost.</li>
              <li>Products must be securely packaged to prevent damage during transit.</li>
            </ul>

            <h2>4. Refund Process</h2>
            <p>Once we receive and inspect the returned product:</p>
            <ul>
              <li>Refunds are processed within <strong>5-7 business days</strong>.</li>
              <li>The refund will be credited to the original payment method (via Razorpay).</li>
              <li>You will receive an email confirmation once the refund is initiated.</li>
            </ul>

            <h2>5. Exchanges</h2>
            <p>
              We offer exchanges for defective or damaged products. To exchange a product:
            </p>
            <ul>
              <li>Follow the return process and mention &quot;Exchange&quot; in your request.</li>
              <li>The replacement will be shipped after we receive the original item.</li>
            </ul>

            <h2>6. Non-Returnable Items</h2>
            <ul>
              <li>Custom-built or made-to-order products</li>
              <li>Products with broken seals on electronic components</li>
              <li>Installation services once completed</li>
              <li>Products purchased more than 7 days ago</li>
            </ul>

            <h2>7. Damaged or Defective Products</h2>
            <p>
              If you receive a damaged or defective product, please contact us immediately through:
            </p>
            <ul>
              <li>Support Ticket system in your Dashboard</li>
              <li>WhatsApp: +91 98765 43210</li>
              <li>Email: support@dhomec.com</li>
            </ul>
            <p>
              Please include photos of the damage and your order details for faster resolution.
            </p>

            <h2>8. Cancellation Policy</h2>
            <ul>
              <li>Orders can be cancelled before they are shipped for a full refund.</li>
              <li>Once an order is shipped, it cannot be cancelled — you may initiate a return after delivery.</li>
            </ul>

            <h2>9. Contact Us</h2>
            <p>For return or refund queries:</p>
            <ul>
              <li>Email: support@dhomec.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Support hours: Mon-Sat, 9:00 AM - 6:00 PM IST</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterModern />
    </div>
  );
}
