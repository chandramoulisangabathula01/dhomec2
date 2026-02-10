import { Header } from "@/components/Header";
import { FooterModern } from "@/components/landing/FooterModern";
import { Metadata } from "next";
import { Shield, Target, Users, Award, Zap, Globe, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Dhomec Solutions",
  description: "Learn about Dhomec Solutions - your trusted partner for industrial automation and access control solutions in India.",
};

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "50+", label: "Products Available" },
  { value: "100+", label: "Happy Clients" },
  { value: "10+", label: "Years Experience" },
];

const values = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "We source and deliver only the highest quality products from renowned international brands.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Continuously adopting cutting-edge technology to stay ahead of the industry curve.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Dedicated support team ensuring seamless experience from inquiry to installation.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Efficient supply chain ensuring timely delivery and installation across India.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Award,
    title: "Certified Solutions",
    description: "All products meet international safety and quality certification standards.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Globe,
    title: "Pan-India Service",
    description: "Serving customers across India with a growing network of partners and installers.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="container-width relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">About Dhomec</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Engineering Trust, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Automating Progress
              </span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              Dhomec Solutions is a leading provider of industrial automation and access control solutions in India. 
              We partner with globally renowned brands like Motorline to deliver premium gate automation, 
              traffic control, and security systems tailored for the Indian market.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-100">
        <div className="container-width">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container-width">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Our Mission</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                Making Automation Accessible to Every Indian Business
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                We believe every business, from a small warehouse to a large industrial park, deserves 
                access to world-class automation solutions. Our mission is to bridge the gap between 
                international technology and Indian infrastructure needs.
              </p>
              <ul className="space-y-3">
                {[
                  "End-to-end consultation and installation support",
                  "Competitive pricing with flexible payment options",
                  "Post-installation maintenance and support",
                  "Custom solutions for unique requirements",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold mb-4">Why Dhomec?</h3>
                <p className="text-blue-100 leading-relaxed mb-6">
                  With a decade of experience in the Indian automation industry, we understand the 
                  unique challenges of implementing global-standard solutions in diverse environments.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-3xl font-extrabold">24/7</p>
                    <p className="text-blue-200 text-sm mt-1">Support Available</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold">98%</p>
                    <p className="text-blue-200 text-sm mt-1">Client Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="container-width">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Our Values</p>
            <h2 className="text-3xl font-extrabold text-slate-900">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${value.color} group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterModern />
    </div>
  );
}
