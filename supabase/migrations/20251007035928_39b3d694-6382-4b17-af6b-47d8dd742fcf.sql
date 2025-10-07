-- Add is_custom column to reminders table
ALTER TABLE public.reminders
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;