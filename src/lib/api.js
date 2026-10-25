/* Small fetch wrapper for the Cegnal API. Attaches the stored JWT,
   throws ApiError with a friendly message on non-2xx responses. */

import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "cegnal-token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const auth = token || getToken();
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection.", 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || `Request failed (${res.status})`,
      res.status,
    );
  }
  return data;
}

/* React hook: fetch plans from the database. */
export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api("/plans")
      .then((d) => {
        if (!cancelled) setPlans(d.plans || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { plans, loading };
}

/* React hook: fetch FAQs from the database. */
export function useFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api("/faqs")
      .then((d) => {
        if (!cancelled) setFaqs(d.faqs || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { faqs, loading };
}

/* React hook: fetch legal content (terms, privacy, risk) from the database. */
export function useLegal() {
  const [legal, setLegal] = useState({});
  useEffect(() => {
    let cancelled = false;
    api("/content/legal")
      .then((d) => {
        if (!cancelled) setLegal(d.legal || {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return { legal };
}

/* React hook: fetch the risk disclaimer text from the database. */
export function useRisks() {
  const [risks, setRisks] = useState("");
  useEffect(() => {
    let cancelled = false;
    api("/content/risk")
      .then((d) => {
        if (!cancelled) setRisks(d.text || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return { risks };
}

/* React hook: fetch all legal content (terms, privacy, risk). */

/* ---------------- Paystack checkout ---------------- */

const PAYSTACK_SCRIPT = "https://js.paystack.co/v2/inline.js";
let paystackScriptPromise = null;

function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve();
  if (!paystackScriptPromise) {
    paystackScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load Paystack."));
      document.head.appendChild(script);
    });
  }
  return paystackScriptPromise;
}

/* Full flow: init on the server → Paystack popup → verify on the server.
   Returns { payment, renewsAt } so the UI can show the renewal date.
   Throws ApiError on failure. */
export async function payWithPaystack({ planId, traderHandle }) {
  const [{ configured, publicKey }, init] = await Promise.all([
    api("/payments/paystack/config"),
    api("/payments/paystack/init", {
      method: "POST",
      body: planId ? { planId } : { traderHandle },
    }),
  ]);
  if (!configured) throw new ApiError("Payments are not available right now.", 503);
  if (!publicKey) throw new ApiError("Payments are not available right now.", 503);

  await loadPaystackScript();

  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: undefined, // the server-issued access code carries the details
      accessCode: init.accessCode,
      onError: (err) =>
        reject(new ApiError(err?.message || "Payment failed. Try again.", 402)),
      onCancel: () => reject(new ApiError("Payment was cancelled.", 499)),
      onSuccess: async () => {
        try {
          const result = await api(
            `/payments/paystack/verify/${encodeURIComponent(init.reference)}`,
          );
          resolve(result.payment);
        } catch (err) {
          reject(err);
        }
      },
    });
    handler.openIframe();
  });
}
