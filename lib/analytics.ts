// Analytics utility — fires GA4 and Facebook Pixel events
// Non-blocking, graceful fallback when scripts aren't loaded

type EventName =
  | "page_view"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "purchase"
  | "search"
  | "book_measurement"
  | "enquiry_submit"
  | "sign_up"
  | "login"
  | "view_category"
  | "wishlist_add"
  | "wishlist_remove"
  | "pincode_check";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function trackEvent(event: EventName, params?: Record<string, any>) {
  try {
    // GA4
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, params);
    }

    // Facebook Pixel
    if (typeof window !== "undefined" && window.fbq) {
      const fbEvents: Record<string, string> = {
        page_view: "PageView",
        view_item: "ViewContent",
        add_to_cart: "AddToCart",
        begin_checkout: "InitiateCheckout",
        purchase: "Purchase",
        search: "Search",
        sign_up: "CompleteRegistration",
        book_measurement: "Lead",
        enquiry_submit: "Contact",
      };

      const fbEvent = fbEvents[event];
      if (fbEvent) {
        window.fbq("track", fbEvent, params);
      }
    }

    // Console log in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event}`, params);
    }
  } catch (e) {
    // Silent fail — analytics should never break the app
  }
}

// E-commerce specific helpers
export function trackProductView(product: { id: string; name: string; price: number; category?: string }) {
  trackEvent("view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
}

export function trackAddToCart(product: { id: string; name: string; price: number; quantity: number }) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
}

export function trackPurchase(orderId: string, total: number, items: any[]) {
  trackEvent("purchase", {
    transaction_id: orderId,
    currency: "INR",
    value: total,
    items,
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent("search", {
    search_term: query,
    results_count: resultsCount,
  });
}
