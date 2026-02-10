import { Header } from "@/components/Header";
import { FooterModern } from "@/components/landing/FooterModern";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dhomec Solutions",
  description: "Learn how Dhomec Solutions collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 mt-3">Last updated: February 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:font-semibold">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
              <li><strong>Order Information:</strong> Shipping address, billing address, and payment details when you make a purchase.</li>
              <li><strong>Communication Data:</strong> Messages sent through our contact form, support tickets, or enquiry system.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited and products viewed.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your customer service requests and support tickets</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul>
              <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
              <li><strong>Shipping Partners:</strong> To deliver your orders</li>
              <li><strong>Service Providers:</strong> Who assist in operating our website</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information, including:
            </p>
            <ul>
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication mechanisms</li>
            </ul>

            <h2>5. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience. You can manage cookie
              preferences through your browser settings. See our cookie banner for more options.
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Data portability</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect
              personal information from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              For any privacy-related queries, contact us at:
            </p>
            <ul>
              <li>Email: privacy@dhomec.com</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterModern />
    </div>
  );
}
