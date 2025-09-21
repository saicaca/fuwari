// Cross-runtime environment helpers (Node & Deno), without using `any`.

type MaybeNodeProcess = {
  process?: { env?: Record<string, string | undefined> };
};

type MaybeDenoEnv = {
  Deno?: { env?: { get?: (key: string) => string | undefined } };
};

export function getEnvVar(name: string): string | undefined {
  const g = globalThis as typeof globalThis & MaybeNodeProcess & MaybeDenoEnv;
  const fromNode = g.process?.env?.[name];
  if (typeof fromNode === "string" && fromNode.length > 0) return fromNode;
  const fromDeno = g.Deno?.env?.get?.(name);
  if (typeof fromDeno === "string" && fromDeno.length > 0) return fromDeno;
  return undefined;
}

export function getEnvFlag(name: string): boolean {
  const v = getEnvVar(name);
  if (v == null) return false;
  const s = String(v).trim();
  if (s === "1") return true;
  return /^(true|yes|on)$/i.test(s);
}
