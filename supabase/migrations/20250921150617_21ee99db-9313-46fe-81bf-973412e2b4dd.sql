BEGIN;

-- Allow math modules in completion table
ALTER TABLE public.module_completion
  DROP CONSTRAINT IF EXISTS module_completion_module_id_check;

ALTER TABLE public.module_completion
  ADD CONSTRAINT module_completion_module_id_check
  CHECK (module_id IN (
    'photosynthesis_6',
    'circuit_builder_6',
    'shape_builder_6',
    'number_adventure_6'
  ));

-- Allow new badges in badges table
ALTER TABLE public.badges
  DROP CONSTRAINT IF EXISTS badges_badge_name_check;

ALTER TABLE public.badges
  ADD CONSTRAINT badges_badge_name_check
  CHECK (badge_name IN (
    'Photosynthesis Master',
    'Circuit Master',
    'Shape Genius',
    'Number Explorer',
    'Code Pathfinder'
  ));

COMMIT;