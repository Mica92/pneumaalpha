/**
 * Server-side Paddle access through the Lovable connector gateway.
 * Server-only: never import from client code.
 */

export type PaddleEnv = "sandbox" | "live";

const GATEWAY_BASE = "https://connector-gateway.lovable.dev/paddle";

function connectionKey(env: PaddleEnv): string {
  const key =
    env === "sandbox" ? process.env.PADDLE_SANDBOX_API_KEY : process.env.PADDLE_LIVE_API_KEY;
  if (!key) throw new Error(`Paddle ${env} API key is not configured`);
  return key;
}

export function paddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_SANDBOX_API_KEY || process.env.PADDLE_LIVE_API_KEY);
}

export async function gatewayFetch(
  env: PaddleEnv,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("X-Connection-Api-Key", connectionKey(env));
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${GATEWAY_BASE}${path}`, { ...init, headers });
}
