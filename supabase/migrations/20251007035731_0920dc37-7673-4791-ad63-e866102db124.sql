-- Create function to delete user account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users (cascades will handle related data)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;