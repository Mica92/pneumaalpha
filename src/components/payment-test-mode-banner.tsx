import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;

  return (
    <div className="w-full border-b border-bronze/30 bg-bronze/10 px-4 py-2 text-center text-micro text-bronze">
      Los pagos hechos en la vista previa son en modo de prueba.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline"
      >
        Leer más
      </a>
    </div>
  );
}
