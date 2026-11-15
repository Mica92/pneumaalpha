import type { SupabaseClient } from "@supabase/supabase-js";

export type AccessStatus = "none" | "pending" | "approved" | "rejected" | "revoked";
export type AccessState = {
  signedIn: boolean;
  status: AccessStatus;
  isAdmin: boolean;
  canUse: boolean;
  email: string | null;
  request: { fullName: string; institution: string; discipline: string; message: string } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = SupabaseClient<any, any, any>;
type Claims = Record<string, unknown>;

/** Reads the caller's teacher status through RLS (own row + own role rows). */
export async function readAccess(supabase: Sb, userId: string, claims: Claims): Promise<AccessState> {
  const anonymous = Boolean(claims["is_anonymous"]);
  const email = typeof claims["email"] === "string" && claims["email"] ? (claims["email"] as string) : null;
  if (anonymous) {
    return { signedIn: false, status: "none", isAdmin: false, canUse: false, email: null, request: null };
  }
  const [{ data: row, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
    supabase
      .from("teacher_access")
      .select("status, full_name, institution, discipline, message")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").limit(1),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const isAdmin = (roles?.length ?? 0) > 0;
  const status = ((row?.status as AccessStatus | undefined) ?? "none") as AccessStatus;
  return {
    signedIn: true,
    status,
    isAdmin,
    canUse: isAdmin || status === "approved",
    email,
    request: row
      ? {
          fullName: row.full_name as string,
          institution: row.institution as string,
          discipline: row.discipline as string,
          message: row.message as string,
        }
      : null,
  };
}

export async function assertTeacher(supabase: Sb, userId: string, claims: Claims): Promise<AccessState> {
  const a = await readAccess(supabase, userId, claims);
  if (!a.canUse) throw new Error("FORBIDDEN_TEACHER");
  return a;
}
