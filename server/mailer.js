/* OTP sender — posts the code to a PHP endpoint on the online server,
   which sends the branded email via PHPMailer (SMTP).
   Endpoint: POST { email, otp } -> { success: boolean, error?: string } */

const OTP_ENDPOINT =
  process.env.OTP_ENDPOINT || "https://www.pkluster.online/cegnal/otp_mailer.php";

export function generateOtp() {
  // 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function mailerConfigured() {
  return true; // the PHP endpoint handles sending
}

export async function sendOtpEmail(to, code) {
  try {
    const res = await fetch(OTP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: to, otp: code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || `OTP endpoint returned ${res.status}`);
    }
    console.log(`[mailer] OTP for ${to} sent via PHP endpoint`);
    return "sent";
  } catch (err) {
    console.error("[mailer] OTP send failed:", err.message);
    return "failed";
  }
}

export default { sendOtpEmail, generateOtp, mailerConfigured };
