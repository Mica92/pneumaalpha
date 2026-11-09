import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PRODUCT_SHOTS, type ShotKey } from "./product-shots";

/** Marco sobrio de navegador alrededor de una captura real del producto. */
export function ProductFrame({
  shot,
  alt,
  priority = false,
  className,
}: {
  shot: ShotKey;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const { lang } = useI18n();
  const data = PRODUCT_SHOTS[shot];
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-foreground/15 bg-navy-deep shadow-inst",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-ivory/10 px-4 py-2.5" aria-hidden="true">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ivory/25" />
          <span className="h-2 w-2 rounded-full bg-ivory/25" />
          <span className="h-2 w-2 rounded-full bg-ivory/25" />
        </span>
        <span className="truncate rounded bg-ivory/8 px-2.5 py-0.5 font-sans text-[0.6875rem] tracking-wide text-ivory/70">
          kionas.app{data.path}
        </span>
      </div>
      <img
        src={data[lang]}
        alt={alt}
        width={1440}
        height={900}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // eslint-disable-next-line react/no-unknown-property
        fetchPriority={priority ? "high" : "auto"}
        className="block aspect-[16/10] h-auto w-full object-cover object-top"
      />
    </figure>
  );
}
