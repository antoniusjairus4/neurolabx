-- Enable real-time updates for module_completion table
ALTER TABLE public.module_completion REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_completion;