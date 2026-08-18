import { sendWhatsAppOtp } from "@/lib/whatsapp";
import { sendSmsOtp } from "@/lib/sms";

// phone must already be normalized to E.164 (+91XXXXXXXXXX) — see src/lib/phone.ts.
// Tries WhatsApp first (cheap/instant); falls back to SMS if that fails for any reason.
export async function sendPhoneOtp(phone: string, otp: string): Promise<void> {
  try {
    await sendWhatsAppOtp(phone, otp);
    return;
  } catch (whatsappError) {
    try {
      await sendSmsOtp(phone, otp);
    } catch (smsError) {
      throw new Error(
        `Failed to send OTP via WhatsApp (${(whatsappError as Error).message}) and SMS (${(smsError as Error).message}).`,
      );
    }
  }
}
