import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// La escala tipográfica propia (text-small, text-micro…) es de tamaño, no de color:
// sin esto, tailwind-merge descartaba el color del texto al combinar variantes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "title", "heading", "subtitle", "lead", "body", "small", "micro"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
