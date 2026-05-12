const API_VERSION = "v19.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

function getConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set.");
  }
  return { phoneNumberId, accessToken };
}

export async function sendWhatsAppOtp(phone: string, otp: string): Promise<void> {
  const { phoneNumberId, accessToken } = getConfig();
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE ?? "shivam_otp";

  const res = await fetch(`${BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
}

// Notifies customer when their order status changes.
// Requires a pre-approved Meta template with two body variables: {{1}} order number, {{2}} status label.
// Template name is configured via WHATSAPP_ORDER_TEMPLATE env var.
export async function sendWhatsAppOrderUpdate(
  phone: string,
  orderNumber: string,
  status: string,
): Promise<void> {
  const { phoneNumberId, accessToken } = getConfig();
  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE ?? "shivam_order_update";

  const statusLabel: Record<string, string> = {
    CONFIRMED: "confirmed",
    PROCESSING: "being processed",
    READY_FOR_PICKUP: "ready for pickup",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  const label = statusLabel[status] ?? status.toLowerCase().replace(/_/g, " ");

  const res = await fetch(`${BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: orderNumber },
              { type: "text", text: label },
            ],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
}
