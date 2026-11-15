import { createFileRoute } from "@tanstack/react-router";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BankBrowser } from "@/components/docente/question-bank";
import { useTr } from "@/lib/docente/use-docente";

export const Route = createFileRoute("/_authenticated/docente/banco")({
  head: () => ({
    meta: [
      { title: "Banco de preguntas — Kionas Docente" },
      { name: "description", content: "Tus preguntas guardadas, con su pauta docente, listas para reutilizar en nuevos exámenes." },
      { property: "og:title", content: "Banco de preguntas — Kionas Docente" },
      { property: "og:description", content: "Busca, revisa y reutiliza tus preguntas de evaluación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BankPage,
});

function BankPage() {
  const tr = useTr();
  return (
    <DocenteShell>
      <PageHeading
        eyebrow="05 · Question bank"
        title={tr("Banco de preguntas", "Question bank")}
        lead={tr(
          "Preguntas que guardaste desde tus exámenes, con respuesta esperada y rúbrica. Son privadas y se copian al insertarlas en un examen.",
          "Questions you saved from your exams, with expected answer and rubric. They are private and copied when inserted into an exam.",
        )}
      />
      <BankBrowser />
    </DocenteShell>
  );
}
