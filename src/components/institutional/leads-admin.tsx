import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { listInstitutionalLeads, type InstitutionalLeadRow } from "@/lib/leads.functions";

/** Panel interno: solicitudes de demostración y piloto de la web institucional. */
export function LeadsAdmin() {
  const { lang } = useI18n();
  const es = lang === "es";
  const fetchLeads = useServerFn(listInstitutionalLeads);
  const { data, isLoading, error } = useQuery({
    queryKey: ["institutional-leads"],
    queryFn: () => fetchLeads() as Promise<InstitutionalLeadRow[]>,
    retry: false,
  });

  const fmt = new Intl.DateTimeFormat(es ? "es-CL" : "en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <section className="mt-12" aria-labelledby="leads-title">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="leads-title" className="font-serif text-subtitle text-foreground">
          {es ? "Solicitudes institucionales" : "Institutional requests"}
        </h2>
        {data ? <span className="text-micro text-muted-foreground">{data.length}</span> : null}
      </div>
      {isLoading && <p className="mt-4 text-small text-muted-foreground">{es ? "Cargando…" : "Loading…"}</p>}
      {error && (
        <p className="mt-4 text-small text-bronze">
          {es ? "No se pudieron cargar las solicitudes." : "Requests could not be loaded."}
        </p>
      )}
      {data && data.length === 0 && (
        <p className="mt-4 text-small text-muted-foreground">
          {es ? "Aún no hay solicitudes desde la web institucional." : "No requests from the institutional site yet."}
        </p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {data.map((l) => (
            <li key={l.id} className="card-editorial p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-small font-semibold text-foreground">
                  {l.full_name} · <span className="font-normal text-muted-foreground">{l.job_title}</span>
                </p>
                <span className="text-micro text-muted-foreground">{fmt.format(new Date(l.created_at))}</span>
              </div>
              <p className="mt-1 text-small text-foreground/85">
                {l.institution} · {l.country}
              </p>
              <p className="mt-1 text-small">
                <a href={`mailto:${l.email}`} className="text-bronze underline-offset-4 hover:underline">
                  {l.email}
                </a>
                <span className="ml-3 text-micro uppercase tracking-widest text-muted-foreground">
                  {l.interest === "pilot" ? (es ? "Piloto" : "Pilot") : es ? "Demostración" : "Demo"} · {l.language}
                </span>
              </p>
              {l.message ? <p className="mt-3 text-small whitespace-pre-line text-foreground/80">{l.message}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
