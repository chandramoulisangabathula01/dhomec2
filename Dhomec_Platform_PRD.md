# 📘 Dhomec Commerce Platform: Product Requirement Document (PRD)

**Project:** Dhomec Scalable Hybrid Commerce Platform
**Client:** Dhomec | **Execution Partner:** Egma
**Date:** July 11, 2025
**Version:** 1.0 (Production Level Specification)

---

## 1. 🚀 Executive Summary (For C-Level)

### The Vision
Dhomec is not merely an online store; it is a **Hybrid Commerce Ecosystem**. Unlike standard e-commerce platforms that only handle direct sales, Dhomec bridges the gap between **digital transactions** and **physical consultation**. The platform is engineered to handle complex logic where products can be bought directly (e.g., standard furniture) OR require on-site measurement and consultation (e.g., custom flooring, automation), mirroring the operational excellence of *Motorline.pt* but tailored for the Indian market.

### Strategic Differentiators
1.  **Hybrid Business Model:** Seamlessly supports Direct-to-Consumer (DTC) sales and B2B/B2C Consultation workflows.
2.  **Scalability First:** Decoupled architecture (Next.js + Node.js) allows for future Franchise models and Seller Marketplaces.
3.  **Operational Efficiency:** Integrated Ticketing, Returns Management (RMA), and Automated Logistics.
4.  **Production-Grade Security:** Granular Role-Based Access Control (RBAC) ensures data privacy and operational security.

---

## 2. 🏗️ Technical Architecture

To achieve "Production Level" quality, we are adhering to a scalable, decoupled stack.

### The Tech Stack
*   **Frontend:** Next.js 14+ (App Router) with Tailwind CSS. (Server-Side Rendering for SEO).
*   **Backend:** Node.js with Express (RESTful API).
*   **Database:** MongoDB Atlas (Sharded for scalability).
*   **Media Storage:** Cloudinary (Auto-optimization).
*   **Infrastructure:** Docker-ready logic, deployed on Vercel/Render/VPS.

### Core Systems
1.  **Auth System:** JWT (Access + Refresh Tokens) + WhatsApp/SMS OTP.
2.  **Payment Engine:** Razorpay (Webhooks for verification).
3.  **Logistics Engine:** Real-time volumetric weight calculation via Shiprocket/Delhivery APIs.

---

## 3. 🛡️ Role-Based Access Control (RBAC) & Security

**Objective:** Strict enforcement of data access. Users must only see data relevant to their specific job function.

### Defined Roles
1.  **SUPER_ADMIN** (CEO/CTO/Managers) - *Full Access*
2.  **SUPPORT_STAFF** (Customer Service) - *Limited to Tickets*
3.  **LOGISTICS_STAFF** (Warehouse/Dispatch) - *Limited to Packing/Shipping*
4.  **CUSTOMER** (End User) - *Personal Data Only*

### Permission Matrix

| Feature / Data | SUPER_ADMIN | SUPPORT_STAFF | LOGISTICS_STAFF | CUSTOMER |
| :--- | :--- | :--- | :--- | :--- |
| **Global Settings** | ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Revenue/Analytics**| ✅ View All | ❌ No Access | ❌ No Access | ❌ No Access |
| **User Management** | ✅ Create/Delete | ❌ No Access | ❌ No Access | Edit Own Profile |
| **Products** | ✅ Create/Edit | 👁️ View Only | 👁️ View Only | 👁️ View Only |
| **Orders** | ✅ View/Edit All | 👁️ View Only | 👁️ **View "Packed" Only** | View Own Only |
| **Tickets** | ✅ View/Assign | ✅ **Edit Assigned** | ❌ No Access | Create/View Own |
| **Shipping Labels** | Generate | ❌ No Access | ✅ **Generate** | ❌ No Access |

### Critical Logic
*   **Logistics View:** The warehouse team will *only* see orders with status `PACKED`. They cannot see revenue data or customer phone numbers unless required for the label.
*   **Support View:** Agents can only view tickets assigned to them to prevent overlapping work.

---

## 4. 🗺️ Platform Navigation & Information Architecture

### A. Public Storefront (Customer)
1.  **Home:** Hero -> Featured Categories -> Trending -> Trust Signals.
2.  **Product Listing (PLP):** Filter by Category, Price, "Buy Online" vs "Consultation".
3.  **Product Detail (PDP):**
    *   *Variant A:* Direct Add to Cart.
    *   *Variant B:* Book Measurement / Request Quote.
4.  **Cart & Checkout:** Stock Check -> OTP Login -> Address -> Payment.
5.  **User Dashboard:** Order History, Ticket Status, Profile.

### B. Admin Portal (Staff)
1.  **Dashboard:** Analytics (Role-dependent).
2.  **Order Management:** Filter by Status (Placed/Packed/Shipped).
3.  **Ticket System:** Kanban view of inquiries.
4.  **Inventory:** Product CRUD + 3D Link embedding.
5.  **Settings:** Shipping Rules, Tax, RBAC Management.

---

## 5. 📱 Screen-by-Screen Specifications

### Screen 01: Homepage
*   **Objective:** Immediate segmentation of user intent (Buy vs. Consult).
*   **Key UX:** Sticky Header, Real-time Search (Elasticsearch), "Book Consultation" CTA.
*   **Data:** Hero Banners, Featured Categories List.

### Screen 02: Product Detail Page (PDP) - Variant A (Direct Sale)
*   **Objective:** Frictionless purchase.
*   **Key UX:** 3D View Button (Zakeke), Pincode Serviceability Check (AJAX), "Add to Cart".
*   **Data:** Price, Inventory Count, Dimensions (L/B/H), Weight.

### Screen 03: Product Detail Page (PDP) - Variant B (Consultation)
*   **Objective:** Lead generation for complex products.
*   **Key UX:** **No Cart Button.** Replaced by "Book Measurement". Pop-up form for Site Photo upload.
*   **Data:** Consultation Fee (if any), Ticket Category tag.

### Screen 04: Smart Cart & Checkout
*   **Objective:** Legal compliance and conversion.
*   **Key UX:** GST Breakdown (CGST/SGST), Address Auto-fill via Pincode.
*   **Logic:** Validate stock before payment init.

### Screen 05: User Dashboard
*   **Objective:** Post-purchase retention.
*   **Key UX:** "Track Order" (Links to Logistics API), "Raise Ticket" (Returns/Complaints).

### Screen 06: Admin - Logistics Panel (Restricted)
*   **Objective:** High-speed fulfillment.
*   **Key UX:** List of `PACKED` orders only. Single-click "Print Label".
*   **Data:** Order ID, Shipping Address, Weight.

---

## 6. 🔌 API Integration & Data Architecture

### A. Logistics & Shipping (Crucial for Profitability)
*Requirement: Sync LxBxH and Weight.*
*   **Logic:** Cart Total Weight = Sum(Product Weights).
*   **API:** Send Total Weight + Dimensions to Shiprocket/Delhivery API (`/serviceability`).
*   **Result:** Real-time shipping cost displayed to user.

### B. Zakeke Visualizer
*   **Flow:** User customizes product -> Zakeke generates `design_id` -> Added to Cart.
*   **Order Payload:** The Admin receives the `preview_url` in the order details to manufacture the custom item.

### C. Payments & Refunds (Razorpay)
*   **Payment:** Standard Web SDK.
*   **Refunds:** Triggered from Admin Dashboard. Checks `refund_amount <= paid_amount`. Calls Razorpay Refund API automatically.

### D. Environment Variables (Required for Deployment)
*Securely configured in Vercel/Render.*

```bash
# AUTH & NOTIFICATIONS
FAST2SMS_API_KEY=...
WHATSAPP_BUSINESS_TOKEN=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=contact@egma.in
SMTP_PASS=... (App Password)

# DATABASE
MONGODB_URI=mongodb+srv://...

# INTEGRATIONS
RAZORPAY_KEY_ID=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
LOGISTICS_API_TOKEN=...
```

---

## 7. 🗄️ Database Models (Schemas)

### User Schema
```json
{
  "_id": "ObjectId",
  "phone": "+919876543210",
  "email": "user@example.com",
  "role": "CUSTOMER",  // Enum: SUPER_ADMIN, SUPPORT_STAFF, LOGISTICS_STAFF, CUSTOMER
  "addresses": [
    { "type": "Home", "pincode": "110001", "line1": "...", "city": "Delhi" }
  ],
  "wishlist": ["prod_id_1", "prod_id_2"]
}
```

### Product Schema
```json
{
  "_id": "ObjectId",
  "name": "Automated Blinds",
  "sku": "BLIND-001",
  "type": "DIRECT_SALE", // Enum: DIRECT_SALE, CONSULTATION_ONLY
  "price": 5000,
  "hsn_code": "9403",
  "stock_quantity": 50,
  "dimensions": { "length": 10, "breadth": 5, "height": 2 }, // cm
  "weight_kg": 1.5,
  "images": ["cloudinary_url_1"],
  "zakeke_template_id": "zk_123", // For 3D customization
  "seo": { "title": "...", "desc": "..." }
}
```

### Order Schema
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "items": [
    { 
      "product_id": "ObjectId", 
      "qty": 2, 
      "price_at_purchase": 5000,
      "customization_data": { "design_id": "...", "preview": "..." } 
    }
  ],
  "total_amount": 10000,
  "tax_breakdown": { "cgst": 900, "sgst": 900 },
  "status": "PLACED", // Enum: PLACED, ACCEPTED, PACKED, SHIPPED, DELIVERED, RETURNED
  "payment": { "method": "RAZORPAY", "txn_id": "pay_123", "status": "CAPTURED" },
  "shipping": { 
    "provider": "DELHIVERY", 
    "awb_code": "123456789", 
    "label_url": "..." 
  }
}
```

### Ticket Schema (Consultation/Support)
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "MEASUREMENT_REQ", // Enum: MEASUREMENT_REQ, RETURN_REQ, GENERAL_QUERY
  "status": "OPEN", // Enum: OPEN, ASSIGNED, RESOLVED, CLOSED
  "assigned_staff_id": "ObjectId", // Links to SUPPORT_STAFF
  "metadata": {
    "preferred_date": "2025-07-20",
    "site_photos": ["url1", "url2"],
    "approx_dimensions": "10x10 ft"
  },
  "history": [
    { "sender": "staff", "message": "Technician assigned.", "timestamp": "..." }
  ]
}
```
