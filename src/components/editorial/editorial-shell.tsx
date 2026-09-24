import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial";
import { useI18n } from "@/lib/i18n";

export function EditorialShell({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  return <><SiteNav/><main className="route-enter relative z-10"><header className="border-b border-border"><div className="mx-auto max-w-6xl px-5 py-10 md:px-8"><Link to="/editorial" className="focus-mist font-serif text-title font-light text-foreground">Editorial</Link><nav aria-label={lang === "es" ? "Categorías editoriales" : "Editorial categories"} className="mt-6 flex gap-x-5 gap-y-3 overflow-x-auto pb-2">{EDITORIAL_CATEGORIES.map((category) => <Link key={category.id} to="/editorial" search={{ categoria:category.id }} className="focus-mist shrink-0 text-micro uppercase text-muted-foreground hover:text-foreground">{category.name[lang]}</Link>)}</nav></div></header>{children}</main><SiteFooter/></>;
}
