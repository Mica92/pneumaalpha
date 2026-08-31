import type { PlanId } from "@/lib/billing.shared";

/**
 * Purchase confirmation email ("aprobación de pago").
 * Sent from the Paddle webhook once a payment is confirmed.
 * No-ops (and logs) while the sender domain / API key is not configured yet,
 * so a missing email setup never breaks webhook processing.
 */

const PLAN_COPY: Record<PlanId, { es: string; en: string }> = {
  monthly: { es: "Beta · Plan mensual", en: "Beta · Monthly plan" },
  semiannual: { es: "Delta · Plan semestral", en: "Delta · Six-month plan" },
  lifetime: { es: "Alpha · Acceso vitalicio", en: "Alpha · Lifetime access" },
};

function renderHtml(opts: {
  lang: "es" | "en";
  plan: PlanId;
  periodEnd: string | null;
  appUrl: string;
}) {
  const es = opts.lang === "es";
  const planName = PLAN_COPY[opts.plan][opts.lang];
  const renewal =
    opts.plan === "lifetime"
      ? es
        ? "Tu acceso es permanente: no hay renovaciones ni cobros futuros."
        : "Your access is permanent: there are no renewals or future charges."
      : opts.periodEnd
        ? es
          ? `Tu periodo actual va hasta el ${new Date(opts.periodEnd).toLocaleDateString("es-CL")}, y se renueva automáticamente hasta que lo canceles.`
          : `Your current period runs until ${new Date(opts.periodEnd).toLocaleDateString("en-GB")}, renewing automatically until you cancel.`
        : es
          ? "Tu suscripción se renueva automáticamente hasta que la canceles."
          : "Your subscription renews automatically until you cancel.";

  return `<!doctype html>
<html lang="${opts.lang}">
  <body style="margin:0;background:#0B0B0D;color:#F2EFE8;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 28px;">
      <p style="letter-spacing:.35em;text-transform:uppercase;font-size:11px;color:#B89A62;margin:0;">Pneum Alpha</p>
      <h1 style="font-weight:300;font-size:28px;line-height:1.25;margin:18px 0 0;">
        ${es ? "Pago aprobado. Tu acceso está abierto." : "Payment approved. Your access is open."}
      </h1>
      <p style="font-size:15px;line-height:1.7;color:#C9C4BA;margin:22px 0 0;">
        ${es ? "Gracias por sumarte." : "Thank you for joining."} ${es ? "Plan contratado:" : "Your plan:"}
        <strong style="color:#F2EFE8;">${planName}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#C9C4BA;margin:14px 0 0;">${renewal}</p>
      <p style="margin:32px 0 0;">
        <a href="${opts.appUrl}/umbral"
           style="display:inline-block;background:#B89A62;color:#0B0B0D;text-decoration:none;padding:14px 26px;letter-spacing:.15em;text-transform:uppercase;font-size:12px;">
          ${es ? "Entrar al umbral" : "Enter the threshold"}
        </a>
      </p>
      <p style="font-size:12px;line-height:1.7;color:#8B867E;margin:36px 0 0;">
        ${
          es
            ? "El recibo y la factura los emite Paddle.com, comerciante registrado de Kionas IA. Tienes 30 días de garantía de devolución."
            : "Your receipt and invoice are issued by Paddle.com, Merchant of Record for Kionas IA. You have a 30-day money-back guarantee."
        }
        <br /><a href="${opts.appUrl}/reembolsos" style="color:#B89A62;">${es ? "Política de reembolsos" : "Refund policy"}</a>
      </p>
    </div>
  </body>
</html>`;
}

export async function sendPurchaseConfirmationEmail(opts: {
  to: string;
  lang: "es" | "en";
  plan: PlanId;
  periodEnd: string | null;
}): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["PURCHASE_EMAIL_FROM"] ?? "Pneum Alpha <no-reply@pneumaalpha.app>";
  if (!apiKey) {
    console.warn("[purchase email] RESEND_API_KEY missing — skipping confirmation email");
    return false;
  }

  const appUrl = process.env["APP_URL"] ?? "https://pneum.lovable.app";
  const subject =
    opts.lang === "es"
      ? "Pago aprobado — tu acceso a Pneum Alpha está activo"
      : "Payment approved — your Pneum Alpha access is active";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject,
        html: renderHtml({ ...opts, appUrl }),
      }),
    });
    if (!res.ok) {
      console.error("[purchase email] send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[purchase email] send error", e);
    return false;
  }
}
