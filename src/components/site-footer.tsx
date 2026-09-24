import { Link } from "@tanstack/react-router";
import { PneumaMark } from "@/components/pneuma-mark";
import { useI18n } from "@/lib/i18n";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";

export function SiteFooter() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <footer className="mt-24 border-t border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div className="border-l border-bronze/40 pl-5">
          <PneumaMark size={24} withWordmark />
          <p className="mt-4 max-w-xs text-small leading-relaxed text-muted-foreground">
            {es
              ? `Pneum ayuda a pensar preguntas, problemas y decisiones complejas, con ${PHILOSOPHER_LIST.length} perspectivas de la historia de la filosofía.`
              : `Pneum helps you think through questions, problems and hard decisions, with ${PHILOSOPHER_LIST.length} perspectives from the history of philosophy.`}
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
            <li>
              <Link to="/buscar" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Buscar" : "Search"}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={es ? "Tu espacio" : "Your space"} className="text-small">
          <p className="label mb-4">{es ? "Tu espacio" : "Your space"}</p>
          <ul className="space-y-2.5 text-muted-foreground">
            <li>
              <Link to="/mi-mapa" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Mi mapa" : "My map"}
              </Link>
            </li>
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
          </ul>
        </nav>

        <nav aria-label="Pneum" className="text-small">
          <p className="label mb-4">Pneum</p>
          <ul className="space-y-2.5 text-muted-foreground">
            <li>
              <Link to="/nosotros" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Nosotros" : "About"}
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Contacto y soporte" : "Contact and support"}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Privacidad" : "Privacy"}
              </Link>
            </li>
            <li>
              <Link to="/terminos" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Términos y condiciones" : "Terms and conditions"}
              </Link>
            </li>
            <li>
              <Link to="/uso-de-ia" className="focus-mist transition-colors hover:text-foreground">
                {es ? "Uso aceptable de IA" : "AI acceptable use"}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-micro text-muted-foreground md:px-8">
          <span>
            Pneum · {new Date().getFullYear()} · {es ? "Vendido por" : "Sold by"} Kionas IA,
            Santiago, Chile ·{" "}
            <a
              href="mailto:soporte@pneum.app"
              className="focus-mist underline underline-offset-4 transition-colors hover:text-foreground"
            >
              soporte@pneum.app
            </a>
          </span>
          <span className="text-muted-foreground/60">
            {es ? "Pensar despacio, otra vez." : "Thinking slowly, again."}
          </span>
        </div>
      </div>
    </footer>
  );
}
