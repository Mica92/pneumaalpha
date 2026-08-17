import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Moderator check done against user_roles directly (RLS lets a user read
 * their own role rows), so no SECURITY DEFINER function is exposed on the API.
 */
export async function hasModeratorRole(
  supabase: SupabaseClient<any, "public", any>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["moderator", "admin"])
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
