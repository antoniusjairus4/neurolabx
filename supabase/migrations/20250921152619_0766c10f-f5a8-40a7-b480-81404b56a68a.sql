BEGIN;

-- Update module completion constraints to support classes 6-12
ALTER TABLE public.module_completion
  DROP CONSTRAINT IF EXISTS module_completion_module_id_check;

ALTER TABLE public.module_completion
  ADD CONSTRAINT module_completion_module_id_check
  CHECK (module_id ~ '^[a-z_]+_[6-9]|1[0-2]$');

-- Update badge constraints to support future class-specific badges
ALTER TABLE public.badges
  DROP CONSTRAINT IF EXISTS badges_badge_name_check;

-- Remove the restrictive badge constraint to allow any badge name
-- This gives us flexibility for future badges across all classes

COMMIT;