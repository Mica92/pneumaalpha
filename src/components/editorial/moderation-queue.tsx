import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPendingEditorialComments, moderateEditorialComment } from "@/lib/editorial-comments.functions";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export function EditorialModerationQueue() {
  const { user } = useAuth(); const { lang } = useI18n(); const qc = useQueryClient();
  const listFn = useServerFn(listPendingEditorialComments); const moderateFn = useServerFn(moderateEditorialComment);
  const query = useQuery({ queryKey:["editorial-moderation", user?.id], queryFn:() => listFn(), enabled:Boolean(user && !user.is_anonymous) });
  if (!query.data?.length) return null;
  async function setStatus(id:string, status:"approved"|"rejected") { await moderateFn({ data:{ id, status } }); await qc.invalidateQueries({ queryKey:["editorial-moderation"] }); }
  return <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8"><div className="border-y border-border py-8"><p className="label">{lang === "es" ? "Moderación" : "Moderation"}</p><h2 className="mt-3 font-serif text-title font-light text-foreground">{lang === "es" ? "Aportes pendientes" : "Pending contributions"}</h2><ul className="mt-6 divide-y divide-border">{query.data.map((comment) => <li key={comment.id} className="py-5"><p className="text-micro text-muted-foreground">{comment.article_slug} · {comment.author_name}</p><p className="mt-2 text-small leading-relaxed text-foreground">{comment.content}</p><div className="mt-3 flex gap-3"><button type="button" onClick={() => void setStatus(comment.id,"approved")} className="btn-ghost-gold focus-mist px-4 py-2 text-micro">{lang === "es" ? "Aprobar" : "Approve"}</button><button type="button" onClick={() => void setStatus(comment.id,"rejected")} className="focus-mist text-micro text-muted-foreground">{lang === "es" ? "Rechazar" : "Reject"}</button></div></li>)}</ul></div></section>;
}
