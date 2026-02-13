
// Email notification utility - works without nodemailer installed
// Falls back to console logging when SMTP is not configured

let transporter: any = null;

async function getTransporter() {
  if (transporter) return transporter;
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  try {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  } catch {
    console.warn("[Notifications] nodemailer not available, using mock emails");
    return null;
  }
}

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(`[Mock Email] To: ${to}, Subject: ${subject}`);
        console.warn("SMTP credentials not set in .env.local. Email simulation only.");
        return { messageId: 'mock-id' };
    }

    try {
        const mailer = await getTransporter();
        if (!mailer) {
            console.warn(`[Mock Email] To: ${to}, Subject: ${subject}`);
            return { messageId: 'mock-id' };
        }

        const info = await mailer.sendMail({
            from: `"Dhomec Support" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};
