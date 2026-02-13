const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const OrderConfirmationEmail = (orderId: string, customerName: string, items: any[], total: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee; }
    .content { padding: 30px 20px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .item-table th, .item-table td { padding: 10px; text-align: left; border-bottom: 1px solid #f0f0f0; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Order Confirmed!</h2>
      <p>Order #${orderId}</p>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Thank you for shopping with Dhomec. We've received your order and are getting it ready!</p>
      
      <table class="item-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.product?.name || item.name || 'Product'}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price_at_purchase || item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        Total: ₹${total.toLocaleString()}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/orders/${orderId}" class="button">View Order Details</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dhomec. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const OrderShippedEmail = (orderId: string, customerName: string, trackingInfo: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background: #f0fdf4; padding: 20px; text-align: center; border-bottom: 1px solid #dcfce7; }
    .content { padding: 30px 20px; }
    .tracking-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #166534;">Your Order is on the Way!</h2>
      <p>Order #${orderId}</p>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Good news! Your order has been dispatched from our warehouse.</p>
      
      <div class="tracking-box">
        <p><strong>Courier:</strong> ${trackingInfo.provider}</p>
        <p><strong>AWB / Tracking #:</strong> ${trackingInfo.awb_code}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        ${trackingInfo.tracking_url 
          ? `<a href="${trackingInfo.tracking_url}" class="button">Track Shipment</a>` 
          : `<span style="color: #64748b;">Tracking URL will be updated shortly on your dashboard.</span>`
        }
      </div>
    </div>
  </div>
</body>
</html>
`;

export const TicketCreatedEmail = (ticketId: string, customerName: string, subject: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background: #eff6ff; padding: 20px; text-align: center; border-bottom: 1px solid #dbeafe; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #1e40af;">Ticket Received</h2>
      <p>Ticket #${ticketId.slice(0, 8)}</p>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>We've received your support request: <strong>"${subject}"</strong>.</p>
      <p>Our team will review it and get back to you shortly. You can track the status or add more details by clicking below.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/dashboard/tickets/${ticketId}" class="button">View Ticket</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const TicketReplyEmail = (ticketId: string, customerName: string, messagePreview: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background: #fff; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6; }
    .message-box { background: #f8fafc; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; font-style: italic; color: #475569; }
    .button { display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Reply on Ticket #${ticketId.slice(0, 8)}</h2>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Our support team has replied to your ticket:</p>
      
      <div class="message-box">
        "${messagePreview}"
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/dashboard/tickets/${ticketId}" class="button">Reply Now</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
