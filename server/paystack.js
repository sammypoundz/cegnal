/* Paystack helper — thin wrapper around the Paystack REST API.
   Keys come from .env: PAYSTACK_SECRET_KEY / PAYSTACK_PUBLIC_KEY.
   Without a secret key the app stays in demo mode (configured = false). */

/* Keys are read lazily (via getters/functions) because ES module imports
   execute before config() loads .env in server/index.js. */
const SECRET = () => process.env.PAYSTACK_SECRET_KEY || "";
const PUBLIC = () => process.env.PAYSTACK_PUBLIC_KEY || "";
const BASE = "https://api.paystack.co";

export function paystackConfigured() {
  return Boolean(SECRET() && PUBLIC());
}

export function paystackPublicKey() {
  return PUBLIC();
}

/* Parse the display fee strings stored on plans/traders ("₦5,000", "$50",
   "Free") into a chargeable amount in kobo (NGN subunits). Returns null
   when the price can't be charged.

   NOTE: Paystack merchant accounts in Nigeria settle in NGN by default; USD
   requires a separate currency enablement. Rather than failing on dollar-
   denominated items, we convert to NGN at a fixed rate so every charge goes
   out in NGN. Update NGN_PER_USD to your preferred rate. */
const NGN_PER_USD = 1600;

export function parseAmount(display) {
  const text = String(display || "").trim();
  if (!text || /^free/i.test(text)) return null;
  const value = Number(text.replace(/[^0-9.]/g, ""));
  if (!value || Number.isNaN(value)) return null;
  const ngn = text.includes("$") ? value * NGN_PER_USD : value;
  return { currency: "NGN", amount: Math.round(ngn * 100) };
}

async function paystackFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SECRET()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    throw new Error(data.message || `Paystack request failed (${res.status})`);
  }
  return data;
}

/* Start a transaction. Returns the checkout URL + reference. */
export async function initializeTransaction({
  email,
  amount,
  currency = "NGN",
  reference,
  metadata,
  callbackUrl,
}) {
  const data = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount,
      currency,
      reference,
      metadata,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    }),
  });
  return data.data; // { authorization_url, access_code, reference }
}

/* Confirm a transaction with Paystack before granting access. */
export async function verifyTransaction(reference) {
  const data = await paystackFetch(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  return data.data; // { status: "success", amount, reference, ... }
}

/* Webhook signature check (HMAC SHA512 of the raw body with the secret). */
export async function verifyWebhookSignature(req) {
  const crypto = await import("node:crypto");
  const signature = req.headers["x-paystack-signature"];
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", SECRET())
    .update(req.rawBody || "")
    .digest("hex");
  return hash === signature;
}

/* Human reference for Payment rows. Timestamp suffix keeps the unique
   constraint happy even after many payments in the same second. */
export function paymentReference() {
  return `CGN-PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    1000 + Math.random() * 9000,
  )}`;
}

export default {
  paystackConfigured,
  paystackPublicKey,
  parseAmount,
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
  paymentReference,
};
