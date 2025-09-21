-- Enable real-time updates for badges table
ALTER TABLE public.badges REPLICA IDENTITY FULL;

-- Add the badges table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;