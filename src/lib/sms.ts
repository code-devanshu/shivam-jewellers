const BASE = "https://control.msg91.com/api/v5/otp";

function getConfig() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  if (!authKey || !senderId || !templateId) {
    throw new Error(
      "MSG91_AUTH_KEY, MSG91_SENDER_ID and MSG91_OTP_TEMPLATE_ID must be set.",
    );
  }
  return { authKey, senderId, templateId };
}

// phone must already be normalized to E.164 (+91XXXXXXXXXX) — see src/lib/phone.ts.
export async function sendSmsOtp(phone: string, otp: string): Promise<void> {
  const { authKey, senderId, templateId } = getConfig();
  const mobile = phone.replace("+", "");

  const params = new URLSearchParams({
    template_id: templateId,
    mobile,
    authkey: authKey,
    otp,
    sender: senderId,
  });

  const res = await fetch(`${BASE}?${params.toString()}`, { method: "POST" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`MSG91 API error: ${JSON.stringify(err)}`);
  }

  const body = await res.json().catch(() => ({}));
  if (body?.type === "error") {
    throw new Error(`MSG91 API error: ${JSON.stringify(body)}`);
  }
}
