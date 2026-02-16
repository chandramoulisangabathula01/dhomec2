import { NextResponse } from "next/server";

const SR_BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getShiprocketToken(): Promise<string | null> {
  // 1. Prefer static token if provided
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
      tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (e) {
    console.error("[Logistics] Shiprocket auth failed:", e);
  }
  return null;
}

// Mock AWB generation for demo
function generateMockAWB() {
  const prefix = "DM";
  const num = Math.floor(Math.random() * 99999999999).toString().padStart(11, "0");
  return `${prefix}${num}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const token = await getShiprocketToken();

    switch (action) {
      case "create_order": {
        const { order } = body;

        if (!order) {
          return NextResponse.json({ error: "Missing order data" }, { status: 400 });
        }

        if (token) {
          try {
            // Calculate volumetric weight
            const dimensions = order.dimensions || { length: 30, breadth: 25, height: 20 };
            const volumetricWeight = (dimensions.length * dimensions.breadth * dimensions.height) / 5000;
            const chargeableWeight = Math.max(order.weight || 1, volumetricWeight);

            const srOrder = {
              order_id: order.id,
              order_date: new Date().toISOString().split("T")[0],
              pickup_location: "Primary",
              billing_customer_name: order.shipping_address?.fullName || "Customer",
              billing_last_name: "",
              billing_address: order.shipping_address?.address || order.shipping_address?.line1 || "",
              billing_address_2: order.shipping_address?.line2 || "",
              billing_city: order.shipping_address?.city || "",
              billing_pincode: order.shipping_address?.pincode || "",
              billing_state: order.shipping_address?.state || "",
              billing_country: "India",
              billing_email: order.shipping_address?.email || "",
              billing_phone: order.shipping_address?.phone || "",
              shipping_is_billing: true,
              order_items: (order.items || []).map((item: any) => ({
                name: item.product?.name || item.name || "Product",
                sku: item.product?.sku || `SKU-${item.product_id}`,
                units: item.quantity,
                selling_price: item.price_at_purchase,
                discount: 0,
                tax: 18,
                hsn: item.product?.hsn_code || "94034000",
              })),
              payment_method: "Prepaid",
              sub_total: order.total_amount,
              length: dimensions.length,
              breadth: dimensions.breadth,
              height: dimensions.height,
              weight: chargeableWeight,
            };

            const res = await fetch(`${SR_BASE}/orders/create/adhoc`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(srOrder),
            });

            const data = await res.json();

            if (data.order_id) {
              return NextResponse.json({
                success: true,
                shiprocket_order_id: data.order_id,
                shipment_id: data.shipment_id,
                awb_code: data.awb_code || null,
                source: "shiprocket",
              });
            } else {
              console.error("[Logistics] Shiprocket create order failure:", data);
              throw new Error(data.message || "Failed to create Shiprocket order");
            }
          } catch (apiErr) {
            console.error("[Logistics] Shiprocket API error, using mock:", apiErr);
          }
        }

        // Mock fallback
        return NextResponse.json({
          success: true,
          shiprocket_order_id: `MOCK-${Date.now()}`,
          shipment_id: `SHP-${Date.now()}`,
          awb_code: generateMockAWB(),
          label_url: null,
          tracking_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/orders/track?awb=${generateMockAWB()}`,
          source: "mock",
        });
      }

      case "create_demo_order": {
        if (token) {
          try {
            const demoOrderId = `DEMO-${Date.now().toString().slice(-6)}`;
            const demoPayload = {
              order_id: demoOrderId,
              order_date: new Date().toISOString().split("T")[0],
              pickup_location: "Primary",
              billing_customer_name: "Test User",
              billing_last_name: "Demo",
              billing_address: "123 Test Street",
              billing_address_2: "Near Test Landmark",
              billing_city: "Mumbai",
              billing_pincode: "400001",
              billing_state: "Maharashtra",
              billing_country: "India",
              billing_email: "test@dhomec.com",
              billing_phone: "9999999999",
              shipping_is_billing: true,
              order_items: [
                {
                  name: "Demo Product",
                  sku: "DEMO-SKU-001",
                  units: 1,
                  selling_price: "100",
                  discount: 0,
                  tax: 0,
                  hsn: 94034000,
                },
              ],
              payment_method: "Prepaid",
              sub_total: 100,
              length: 10,
              breadth: 10,
              height: 10,
              weight: 0.5,
            };

            const res = await fetch(`${SR_BASE}/orders/create/adhoc`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(demoPayload),
            });

            const data = await res.json();

            if (data.order_id) {
              return NextResponse.json({
                success: true,
                message: "Demo order created successfully",
                shiprocket_order_id: data.order_id,
                shipment_id: data.shipment_id,
                awb_code: data.awb_code || null,
                payload_used: demoPayload
              });
            } else {
              return NextResponse.json({
                success: false,
                error: data.message || "Failed to create demo order",
                full_response: data
              }, { status: 400 });
            }
          } catch (apiErr: any) {
            return NextResponse.json({
              success: false,
              error: apiErr.message
            }, { status: 500 });
          }
        }
        
        return NextResponse.json({ 
            success: false, 
            error: "Authentication failed. Check SR_EMAIL and SR_PASSWORD." 
        }, { status: 401 });
      }

      case "generate_awb": {
        const { shipment_id } = body;

        if (token && shipment_id) {
          try {
            const res = await fetch(`${SR_BASE}/courier/assign/awb`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ shipment_id }),
            });
            const data = await res.json();

            if (data.response?.data?.awb_code) {
              return NextResponse.json({
                success: true,
                awb_code: data.response.data.awb_code,
                courier_name: data.response.data.courier_name,
                source: "shiprocket",
              });
            }
          } catch (apiErr) {
            console.error("[Logistics] AWB generation error:", apiErr);
          }
        }

        // Mock fallback
        return NextResponse.json({
          success: true,
          awb_code: generateMockAWB(),
          courier_name: "Delhivery Surface",
          source: "mock",
        });
      }

      case "generate_label": {
        const { shipment_id } = body;

        if (token && shipment_id) {
          try {
            const res = await fetch(`${SR_BASE}/courier/generate/label`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ shipment_id: [shipment_id] }),
            });
            const data = await res.json();

            if (data.label_url) {
              return NextResponse.json({
                success: true,
                label_url: data.label_url,
                source: "shiprocket",
              });
            }
          } catch (apiErr) {
            console.error("[Logistics] Label generation error:", apiErr);
          }
        }

        // Mock fallback
        return NextResponse.json({
          success: true,
          label_url: null,
          message: "Label will be available when integrated with shipping provider",
          source: "mock",
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Logistics Shipment Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
