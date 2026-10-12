import ReactMarkdown from "react-markdown";

/** Keep generated formatting semantic; never display raw Markdown as plain text. */
export function OntologicalResponse({ text }: { text: string }) {
  return (
    <article className="ontology-response mt-12 min-w-0 border-t border-border/70 pt-8">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </article>
  );
}