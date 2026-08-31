REVOKE EXECUTE ON FUNCTION public.lifetime_seats_taken() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lifetime_seats_taken() TO service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;