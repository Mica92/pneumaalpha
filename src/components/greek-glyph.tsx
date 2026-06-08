import { useEffect, useState } from "react";

const GREEK = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";

function pick() {
  return GREEK[Math.floor(Math.random() * GREEK.length)];
}

export function GreekGlyph({ className, intervalMs = 600 }: { className?: string; intervalMs?: number }) {
  const [g, setG] = useState(() => pick());
  useEffect(() => {
    const id = setInterval(() => setG(pick()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return <span className={className} aria-hidden="true">{g}</span>;
}
