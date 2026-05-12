import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY must be set.");
  return new Resend(apiKey);
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from: `Shivam Jewellers <${from}>`,
    to,
    subject: `Your Shivam Jewellers OTP: ${otp}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#333">
        <h2 style="color:#b5724a">Shivam Jewellers</h2>
        <p>Your one-time password is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#b5724a;margin:16px 0">${otp}</div>
        <p style="color:#666;font-size:14px">This code is valid for 10 minutes. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Shivam Jewellers · BIS Hallmark Certified</p>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  pdfBuffer: Buffer;
}): Promise<void> {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from: `Shivam Jewellers <${from}>`,
    to: params.to,
    subject: `Your order ${params.orderNumber} is confirmed — Shivam Jewellers`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333">
        <h2 style="color:#b5724a">Shivam Jewellers</h2>
        <p>Dear ${params.customerName || "Valued Customer"},</p>
        <p>Thank you for your order! Your order <strong>${params.orderNumber}</strong> has been confirmed.</p>
        <p>Please find your invoice attached to this email. You can also view and download it from your account.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <br/>
        <p style="color:#888;font-size:13px">Shivam Jewellers · BIS Hallmark Certified</p>
      </div>
    `,
    attachments: [
      {
        filename: `${params.orderNumber}.pdf`,
        content: params.pdfBuffer,
      },
    ],
  });
}
