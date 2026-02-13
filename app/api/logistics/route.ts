import { NextResponse } from "next/server";

// Shiprocket API base
const SR_BASE = "https://apiv2.shiprocket.in/v1/external";

// Cache token for reuse (in-memory, resets on cold start)
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getShiprocketToken(): Promise<string | null> {
  // 1. Prefer static token if provided (User provided case)
  if (process.env.SR_TOKEN) {
    return process.env.SR_TOKEN;
  }

  // 2. Check cached dynamic token
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  // 3. Login to get new token
  const email = process.env.SR_EMAIL;
  const password = process.env.SR_PASSWORD;

  if (!email || !password) return null;

  try {
    const res = await fetch(`${SR_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
      return cachedToken;
    }
  } catch (e) {
    console.error("[Logistics] Shiprocket auth failed:", e);
  }
  return null;
}

// Mock serviceability data for demo
function getMockServiceability(pincode: string) {
  // Simulate Indian metro pincodes as serviceable
  const metroPrefixes = ["110", "400", "560", "600", "500", "700", "380", "302", "411", "201", "226"];
  const isMetro = metroPrefixes.some((p) => pincode.startsWith(p));

  if (!isMetro && Math.random() > 0.7) {
    return {
      serviceable: false,
      message: "Sorry, delivery is not available to this pincode currently.",
      couriers: [],
    };
  }

  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + (isMetro ? 3 : 7));

  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    serviceable: true,
    message: `Delivery by ${formattedDate}`,
    estimated_days: isMetro ? 3 : 7,
    couriers: [
      {
        name: "Delhivery Surface",
        rate: isMetro ? 150 : 250,
        etd: isMetro ? "2-3 days" : "5-7 days",
      },
      {
        name: "Bluedart Air",
        rate: isMetro ? 300 : 450,
        etd: isMetro ? "1-2 days" : "3-4 days",
      },
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pickup_pincode = "110001", // Default warehouse pincode
      delivery_pincode,
      weight = 1,
      cod = 0,
    } = body;

    if (!delivery_pincode || delivery_pincode.length !== 6) {
      return NextResponse.json(
        { error: "Invalid pincode. Must be 6 digits." },
        { status: 400 }
      );
    }

    // Try real Shiprocket first
    const token = await getShiprocketToken();

    if (token) {
      try {
        const serviceRes = await fetch(
          `${SR_BASE}/courier/serviceability?pickup_postcode=${pickup_pincode}&delivery_postcode=${delivery_pincode}&weight=${weight}&cod=${cod}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await serviceRes.json();

        if (data.data?.available_courier_companies?.length > 0) {
          const couriers = data.data.available_courier_companies.slice(0, 3).map((c: any) => ({
            name: c.courier_name,
            rate: c.rate,
            etd: c.etd,
          }));

          return NextResponse.json({
            serviceable: true,
            message: `Delivery in ${couriers[0].etd}`,
            couriers,
            source: "shiprocket",
          });
        } else {
          return NextResponse.json({
            serviceable: false,
            message: "Not deliverable to this area.",
            couriers: [],
            source: "shiprocket",
          });
        }
      } catch (apiErr) {
        console.error("[Logistics] Shiprocket API error, falling back to mock:", apiErr);
      }
    }

    // Fallback to mock
    const mockData = getMockServiceability(delivery_pincode);
    return NextResponse.json({ ...mockData, source: "mock" });
  } catch (error: any) {
    console.error("[Logistics] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
