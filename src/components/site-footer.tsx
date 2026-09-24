import { Link } from "@tanstack/react-router";
import { PneumaMark } from "@/components/pneuma-mark";
import { useI18n } from "@/lib/i18n";

const GROUPS = [
  { es:"Pensar", en:"Think", links:[
    {to:"/oraculo",es:"Espacio de reflexión",en:"Reflection space"},
    {to:"/explorar",es:"Oráculo",en:"Oracle"},
    {to:"/umbral",es:"Instrumentos",en:"Instruments"},
  ]},
  { es:"Explorar", en:"Explore", links:[
    {to:"/editorial",es:"Editorial",en:"Editorial"},
    {to:"/filosofos",es:"Perspectivas",en:"Perspectives"},
    {to:"/ideas",es:"Ideas",en:"Ideas"},
    {to:"/rutas",es:"Rutas",en:"Paths"},
    {to:"/situaciones",es:"Situaciones",en:"Situations"},
    {to:"/conocimiento",es:"Red",en:"Network"},
  ]},
  { es:"Tu espacio", en:"Your space", links:[
    {to:"/mi-mapa",es:"Mapa",en:"Map"},
    {to:"/recorrido",es:"Recorrido",en:"Journey"},
    {to:"/biblioteca",es:"Biblioteca",en:"Library"},
    {to:"/perfil",es:"Perfil y memoria",en:"Profile and memory"},
  ]},
  { es:"Pneum.app", en:"Pneum.app", links:[
    {to:"/nosotros",es:"Nosotros",en:"About"},
    {to:"/contacto",es:"Contacto",en:"Contact"},
    {to:"/privacy",es:"Privacidad",en:"Privacy"},
    {to:"/terminos",es:"Términos",en:"Terms"},
    {to:"/uso-de-ia",es:"Uso de IA",en:"AI use"},
  ]},
] as const;

export function SiteFooter(){const {lang}=useI18n();const es=lang==="es";return <footer className="mt-24 border-t border-border bg-background/90"><div className="mx-auto max-w-6xl px-5 py-14 md:px-8"><div className="grid gap-10 border-b border-border pb-12 lg:grid-cols-[1.4fr_3fr]"><div className="border-l border-bronze/50 pl-5"><PneumaMark size={24} withWordmark/><p className="mt-4 max-w-sm text-small leading-relaxed text-muted-foreground">{es?"Un espacio para estructurar y comprender tu pensamiento con mayor claridad, usando la filosofía como instrumento.":"A space for structuring and understanding your thinking more clearly, using philosophy as an instrument."}</p><p className="mt-5 text-micro text-bronze-bright">{es?"Tu pensamiento te pertenece.":"Your thinking belongs to you."}</p></div><div className="grid grid-cols-2 gap-8 md:grid-cols-4">{GROUPS.map((group)=><nav key={group.en} aria-label={group[lang]}><p className="label mb-4">{group[lang]}</p><ul className="space-y-2.5 text-small text-muted-foreground">{group.links.map((item)=><li key={item.to}><Link to={item.to} className="focus-mist transition-colors hover:text-foreground">{item[lang]}</Link></li>)}</ul></nav>)}</div></div><div className="flex flex-wrap items-center justify-between gap-4 py-6 text-micro text-muted-foreground"><span>Pneum.app · {new Date().getFullYear()} · Kionas IA · Santiago, Chile</span><span><a href="mailto:soporte@pneum.app" className="focus-mist hover:text-foreground">soporte@pneum.app</a> · <a href="mailto:privacy@pneum.app" className="focus-mist hover:text-foreground">privacy@pneum.app</a></span></div></div></footer>}
