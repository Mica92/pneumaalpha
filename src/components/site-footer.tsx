import { Link } from "@tanstack/react-router";
import { PneumaMark } from "@/components/pneuma-mark";
import { useI18n } from "@/lib/i18n";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";

export function SiteFooter() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <PneumaMark size={24} withWordmark />
          <p className="mt-4 max-w-xs text-small leading-relaxed text-muted-foreground">
            {es
              ? `${PHILOSOPHER_LIST.length} conciencias filosóficas reconstruidas para pensar tu vida, no para recitar historia.`
              : `${PHILOSOPHER_LIST.length} reconstructed philosophical minds, here to think your life through — not to recite history.`}
          </p>
        </div>

        <nav aria-label={es ? "Explorar" : "Explore"} className="text-small">
          <p className="label mb-4">{es ? "Explorar" : "Explore"}</p>
          <ul className="space-y-2.5 text-muted-foreground">
            <li>
              <Link to="/filosofos" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Filósofos" : "Philosophers"}
              </Link>
            </li>
            <li>
              <Link to="/ideas" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Grandes ideas" : "Great ideas"}
              </Link>
            </li>
            <li>
              <Link to="/rutas" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Rutas filosóficas" : "Philosophical paths"}
              </Link>
            </li>
            <li>
              <Link to="/umbral" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Instrumentos" : "Instruments"}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={es ? "Tu espacio" : "Your space"} className="text-small">
          <p className="label mb-4">{es ? "Tu espacio" : "Your space"}</p>
          <ul className="space-y-2.5 text-muted-foreground">
            <li>
              <Link to="/recorrido" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Mi recorrido" : "My journey"}
              </Link>
            </li>
            <li>
              <Link to="/biblioteca" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Biblioteca de ideas" : "Library of ideas"}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Privacidad" : "Privacy"}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-micro text-muted-foreground md:px-8">
          <span>Pneuma Alpha · {new Date().getFullYear()}</span>
          <span className="text-muted-foreground/60">
            {es ? "Pensar despacio, otra vez." : "Thinking slowly, again."}
          </span>
        </div>
      </div>
    </footer>
  );
}
