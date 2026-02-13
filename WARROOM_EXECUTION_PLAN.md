# 🚨 Dhomec War Room Execution Plan
**Created:** 2026-02-13
**Stack:** Next.js 16 + Supabase + Tailwind + Razorpay

---

## 📊 Current State Audit

### ✅ ALREADY BUILT (No Rework Needed)
| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 16 Project | ✅ Done | Running on v16.1.4 |
| Supabase Connection | ✅ Done | Client + Server utils |
| Auth (Email/Password) | ✅ Done | Login/Signup pages |
| Products Table | ✅ Done | 52 products, full schema with type, weight, dimensions |
| Categories Table | ✅ Done | 14 categories |
| Orders Table | ✅ Done | Full lifecycle with status enum |
| Order Items Table | ✅ Done | With price_at_purchase |
| Tickets Table | ✅ Done | With status, priority, metadata |
| Ticket Messages | ✅ Done | Staff/customer messaging |
| Profiles Table | ✅ Done | Roles, addresses, phone |
| Cart (LocalStorage) | ✅ Done | CartContext with drawer |
| Checkout Page | ✅ Done | Form + Razorpay integration |
| Razorpay Integration | ✅ Done | With mock fallback |
| Product Detail Page | ✅ Done | Gallery, Info, Reviews |
| Product Listing Page | ✅ Done | By category |
| Admin Dashboard | ✅ Done | Orders, Products, Tickets, Users |
| Wishlist | ✅ Done | DB-backed |
| Reviews | ✅ Done | DB-backed |
| Returns System | ✅ Done | Full lifecycle |
| RLS Policies | ✅ Done | On all tables |
| Order Status History | ✅ Done | Audit trail |
| SEO Metadata | ✅ Done | OpenGraph, dynamic titles |
| WhatsApp Float | ✅ Done | Floating button |
| Cookie Consent | ✅ Done | GDPR compliance |
| Hero Section | ✅ Done | Animated, search-enabled |
| Landing Sections | ✅ Done | 10+ sections |
| Toast Notifications | ✅ Done | Global provider |

### 🔴 GAPS TO FILL (FSD Requirements Not Yet Built)

#### Priority 1: Critical for Demo Flow
1. **Pincode Serviceability Check** - FSD §3.2: Check delivery feasibility
2. **Product Type Handling (DIRECT vs CONSULTATION)** - FSD §3.0 vs §4.0
3. **"Book Measurement Visit" Modal** - FSD §4.2: Full booking flow
4. **GST Breakdown in Checkout** - FSD §5.2: CGST/SGST display
5. **Logistics API Route** - FSD Part 4A: Shiprocket integration

#### Priority 2: Important for Completeness
6. **OTP Authentication** - FSD §2.0: Phone-based OTP login
7. **Search with Elasticsearch** - FSD §1.1: 3+ char live search
8. **Sticky Mobile Bottom Bar** - FSD §3.3: Mobile CTA
9. **Saved Addresses in Checkout** - FSD §5.1: Pre-fill addresses
10. **Admin Logistics Dashboard** - FSD §6.0: Ship order workflow

#### Priority 3: Polish
11. **Skeleton Loaders** - Loading states improvement
12. **Error Toasts** - Better error handling
13. **Analytics Events** - GA4 + Facebook Pixel

---

## 🎯 Implementation Order (Sprint Priority)

### Sprint 1: Product Type Logic + Consultation Flow
- Add DIRECT/CONSULTATION type-aware PDP rendering
- Build "Book Measurement Visit" modal
- Create pincode check API + UI

### Sprint 2: Checkout Enhancements
- Add GST breakdown display
- Add saved addresses support
- Sticky mobile bottom bar on PDP

### Sprint 3: Logistics + Admin
- Shiprocket API route (with mock fallback)
- Admin ship order workflow
- Label generation / AWB tracking

### Sprint 4: Auth Enhancement + Search
- Phone OTP (Supabase SMS, if configured)
- Live search improvements
- Skeleton loaders everywhere
