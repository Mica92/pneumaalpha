import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { createEditorialComment, deleteEditorialComment, editEditorialComment, listEditorialComments, listMyEditorialComments, reportEditorialComment, type EditorialComment } from "@/lib/editorial-comments.functions";

export function EditorialComments({ articleKey }: { articleKey: string }) {
  const { lang } = useI18n();
  const { user, loading } = useAuth();
  const identified = Boolean(user && !user.is_anonymous);
  const queryClient = useQueryClient();
  const publicFn = useServerFn(listEditorialComments);
  const mineFn = useServerFn(listMyEditorialComments);
  const createFn = useServerFn(createEditorialComment);
  const editFn = useServerFn(editEditorialComment);
  const deleteFn = useServerFn(deleteEditorialComment);
  const reportFn = useServerFn(reportEditorialComment);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const publicQuery = useQuery({ queryKey:["editorial-comments", articleKey], queryFn:() => publicFn({ data:{ articleSlug:articleKey } }) });
  const mineQuery = useQuery({ queryKey:["my-editorial-comments", articleKey, user?.id], queryFn:() => mineFn({ data:{ articleSlug:articleKey } }), enabled:identified });
  const comments = useMemo(() => {
    const map = new Map<string, EditorialComment>();
    for (const row of publicQuery.data ?? []) map.set(row.id, row);
    for (const row of mineQuery.data ?? []) map.set(row.id, row);
    return [...map.values()].sort((a,b) => a.created_at.localeCompare(b.created_at));
  }, [publicQuery.data, mineQuery.data]);

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey:["editorial-comments", articleKey] }),
      queryClient.invalidateQueries({ queryKey:["my-editorial-comments", articleKey] }),
    ]);
  }

  async function submit() {
    const content = text.trim();
    if (content.length < 2 || content.length > 1500) return;
    setBusy(true); setNotice("");
    try {
      if (editing) await editFn({ data:{ id:editing, content } });
      else await createFn({ data:{ articleSlug:articleKey, content, lang } });
      track("editorial_comment_submitted", { article:articleKey, language:lang });
      setText(""); setEditing(null);
      setNotice(lang === "es" ? "Recibido. Aparecerá después de la revisión editorial." : "Received. It will appear after editorial review.");
      await refresh();
    } catch {
      setNotice(lang === "es" ? "No pudimos enviar el comentario. Inténtalo de nuevo." : "We could not submit the comment. Please try again.");
    } finally { setBusy(false); }
  }

  async function signIn() { await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href }); }

  return <section id="conversacion" className="mt-20 border-t border-border pt-12" aria-labelledby="comments-title">
    <p className="label">{lang === "es" ? "Conversación editorial" : "Editorial conversation"}</p>
    <h2 id="comments-title" className="mt-3 font-serif text-title font-light text-foreground">{lang === "es" ? "Continúa la pregunta" : "Continue the question"}</h2>
    <p className="mt-3 max-w-2xl text-small leading-relaxed text-muted-foreground">{lang === "es" ? "Comenta con razones, preguntas o desacuerdos. Cada aporte se revisa antes de hacerse público." : "Comment with reasons, questions or disagreements. Every contribution is reviewed before becoming public."}</p>

    {!loading && !identified ? <div className="mt-8 border-y border-border py-6">
      <p className="text-small text-muted-foreground">{lang === "es" ? "La lectura es pública. Para comentar necesitas una cuenta identificada." : "Reading is public. An identified account is required to comment."}</p>
      <button type="button" onClick={signIn} className="btn-ghost-gold focus-mist mt-4 px-5 py-2.5 text-micro">{lang === "es" ? "Entrar con Google" : "Sign in with Google"}</button>
    </div> : identified ? <form className="mt-8" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <label htmlFor="editorial-comment" className="text-small font-medium text-foreground">{editing ? (lang === "es" ? "Editar tu aporte" : "Edit your contribution") : (lang === "es" ? "Tu aporte" : "Your contribution")}</label>
      <textarea id="editorial-comment" value={text} onChange={(event) => setText(event.target.value)} minLength={2} maxLength={1500} rows={4} className="focus-mist mt-3 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-small leading-relaxed text-foreground placeholder:text-muted-foreground" placeholder={lang === "es" ? "¿Qué matizarías, preguntarías o discutirías?" : "What would you nuance, question or dispute?"} />
      <div className="mt-3 flex items-center justify-between gap-4"><span className="text-micro text-muted-foreground">{text.length}/1500</span><div className="flex gap-3">{editing && <button type="button" onClick={() => { setEditing(null); setText(""); }} className="focus-mist text-micro text-muted-foreground">{lang === "es" ? "Cancelar" : "Cancel"}</button>}<button type="submit" disabled={busy || text.trim().length < 2} className="btn-gold focus-mist px-5 py-2 text-micro disabled:opacity-50">{busy ? (lang === "es" ? "Enviando…" : "Sending…") : (lang === "es" ? "Enviar a revisión" : "Submit for review")}</button></div></div>
      {notice && <p role="status" className="mt-3 text-small text-bronze-bright">{notice}</p>}
    </form> : null}

    <div className="mt-10">
      <p className="label">{comments.filter((c) => c.status === "approved").length} {lang === "es" ? "aportes publicados" : "published contributions"}</p>
      {comments.length === 0 ? <p className="mt-5 text-small text-muted-foreground">{lang === "es" ? "Todavía no hay comentarios. Puedes abrir la conversación." : "There are no comments yet. You can open the conversation."}</p> : <ol className="mt-5 divide-y divide-border border-y border-border">{comments.map((comment) => <li key={comment.id} className="py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><strong className="font-serif text-subtitle font-light text-foreground">{comment.author_name}</strong><span className="text-micro text-muted-foreground">{new Intl.DateTimeFormat(lang, { dateStyle:"medium" }).format(new Date(comment.created_at))}{comment.status !== "approved" ? ` · ${lang === "es" ? "Pendiente de revisión" : "Pending review"}` : ""}</span></div>
        <p className="mt-3 whitespace-pre-wrap text-small leading-relaxed text-foreground/90">{comment.content}</p>
        <div className="mt-3 flex gap-4">{comment.user_id === user?.id ? <><button type="button" onClick={() => { setEditing(comment.id); setText(comment.content); }} className="focus-mist text-micro text-muted-foreground hover:text-foreground">{lang === "es" ? "Editar" : "Edit"}</button><button type="button" onClick={async () => { await deleteFn({ data:{ id:comment.id } }); await refresh(); }} className="focus-mist text-micro text-muted-foreground hover:text-foreground">{lang === "es" ? "Eliminar" : "Delete"}</button></> : identified && comment.status === "approved" ? <button type="button" onClick={async () => { await reportFn({ data:{ id:comment.id, reason:lang === "es" ? "Revisión solicitada por un lector" : "Reader requested review" } }); setNotice(lang === "es" ? "Gracias. Revisaremos este aporte." : "Thank you. We will review this contribution."); }} className="focus-mist text-micro text-muted-foreground hover:text-foreground">{lang === "es" ? "Reportar" : "Report"}</button> : null}</div>
      </li>)}</ol>}
    </div>
  </section>;
}
