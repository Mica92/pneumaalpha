import { Link } from "@tanstack/react-router";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { centralQuestion } from "@/lib/discovery";
import { useI18n } from "@/lib/i18n";

export function PhilosopherCard({ id }: { id: PhilosopherId }) {
  const { lang } = useI18n();
  const p = PHILOSOPHERS[id];
  if (!p) return null;
  const profile = profileOf(id);
  const portrait = portraitOf(id);
  const themes = (profile?.expertise ?? []).slice(0, 3);

  return (
    <article className="card-editorial group flex h-full flex-col overflow-hidden">
      <Link
        to="/filosofos/$id"
        params={{ id }}
        className="focus-mist block"
        aria-label={`${p.name} — ${lang === "es" ? "ver perfil" : "view profile"}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {portrait ? (
            <img
              src={portrait}
              alt={`${p.name}, ${profile?.years ?? ""}`}
              loading="lazy"
              className={`h-full w-full object-cover ${portraitFocus(id)} opacity-70 grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-90`}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-4xl text-bronze">
              {p.glyph}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="label">{profile?.years ?? p.subtitle[lang]}</p>
        <h3 className="mt-2 font-serif text-2xl font-normal text-foreground">{p.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{p.subtitle[lang]}</p>

        <p className="mt-4 font-serif text-base italic leading-snug text-bronze-bright">
          {centralQuestion(id, lang)}
        </p>

        {themes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {themes.map((t) => (
              <li
                key={t.en}
                className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {t[lang]}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-3 pt-5">
          <Link
            to="/$philosopher"
            params={{ philosopher: id }}
            className="btn-gold focus-mist px-4 py-2 text-xs"
          >
            {lang === "es" ? "Conversar" : "Talk"}
          </Link>
          <Link
            to="/filosofos/$id"
            params={{ id }}
            className="focus-mist text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {lang === "es" ? "Ver perfil" : "View profile"}
          </Link>
        </div>
      </div>
    </article>
  );
}
