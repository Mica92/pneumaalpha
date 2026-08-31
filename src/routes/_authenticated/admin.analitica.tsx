import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/lib/analytics.functions";
import { LIFETIME_SEATS } from "@/lib/billing.shared";

export const Route = createFileRoute("/_authenticated/admin/analitica")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "Analítica interna — Pneum" },
      {
        name: "description",
        content: "Panel interno de retención y conversión de Pneum.",
      },
      { property: "og:title", content: "Analítica interna — Pneum" },
      { property: "og:description", content: "Panel interno de retención y conversión." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const LABELS: Record<string, { es: string; en: string }> = {
  visit: { es: "Visitas", en: "Visits" },
  chat_opened: { es: "Abrió un chat", en: "Opened a chat" },
  message_sent: { es: "Envió un mensaje", en: "Sent a message" },
  paywall_hit: { es: "Llegó al muro", en: "Hit the wall" },
  pricing_viewed: { es: "Vio los planes", en: "Viewed pricing" },
  checkout_started: { es: "Inició el pago", en: "Started checkout" },
  purchase_completed: { es: "Compró", en: "Purchased" },
};

function AnalyticsPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const fetchOverview = useServerFn(getAnalyticsOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => fetchOverview({ data: { days: 90 } }) as Promise<AnalyticsOverview>,
    retry: false,
  });

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <p className="label">{es ? "Interno" : "Internal"}</p>
        <h1 className="mt-4 font-serif text-title font-light text-foreground">
          {es ? "Retención y conversión" : "Retention and conversion"}
        </h1>

        {isLoading && (
          <p className="mt-8 text-small text-muted-foreground">{es ? "Cargando…" : "Loading…"}</p>
        )}
        {error && (
          <p className="mt-8 text-small text-bronze">
            {es
              ? "Solo los administradores pueden ver este panel."
              : "Only administrators can see this panel."}
          </p>
        )}

        {data && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="card-editorial p-5">
                <p className="label">{es ? "Conversión" : "Conversion"}</p>
                <p className="mt-2 font-serif text-title font-light text-foreground">
                  {data.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="card-editorial p-5">
                <p className="label">{es ? "Mensajes por usuario" : "Messages per user"}</p>
                <p className="mt-2 font-serif text-title font-light text-foreground">
                  {data.messages.avgMessages.toFixed(1)}
                </p>
              </div>
              <div className="card-editorial p-5">
                <p className="label">{es ? "Cupos vitalicios" : "Lifetime seats"}</p>
                <p className="mt-2 font-serif text-title font-light text-foreground">
                  {data.lifetimeSeatsTaken}/{LIFETIME_SEATS}
                </p>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="font-serif text-subtitle text-foreground">
                {es ? "Embudo" : "Funnel"}
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                {data.funnel.map((step) => {
                  const top = data.funnel[0]?.users || 1;
                  const pct = Math.round((step.users / top) * 100);
                  return (
                    <div key={step.event} className="card-editorial p-4">
                      <div className="flex items-baseline justify-between text-small">
                        <span className="text-foreground">
                          {LABELS[step.event]?.[lang] ?? step.event}
                        </span>
                        <span className="text-muted-foreground">
                          {step.users} · {pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-border/50">
                        <div
                          className="h-1.5 rounded-full bg-bronze"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-serif text-subtitle text-foreground">
                {es ? "Suscripciones activas" : "Active subscriptions"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {data.planCounts.map((p) => (
                  <div key={p.plan} className="card-editorial p-5">
                    <p className="label">{p.plan}</p>
                    <p className="mt-2 font-serif text-subtitle text-foreground">{p.count}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-serif text-subtitle text-foreground">
                {es ? "Retención por cohorte semanal" : "Weekly cohort retention"}
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-normal">{es ? "Cohorte" : "Cohort"}</th>
                      <th className="py-2 pr-4 font-normal">{es ? "Usuarios" : "Users"}</th>
                      <th className="py-2 pr-4 font-normal">D1</th>
                      <th className="py-2 pr-4 font-normal">D7</th>
                      <th className="py-2 pr-4 font-normal">D30</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.retention.map((r) => (
                      <tr key={r.cohort} className="border-t border-border/50 text-foreground">
                        <td className="py-2 pr-4">{r.cohort}</td>
                        <td className="py-2 pr-4">{r.users}</td>
                        <td className="py-2 pr-4">{r.d1}</td>
                        <td className="py-2 pr-4">{r.d7}</td>
                        <td className="py-2 pr-4">{r.d30}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
