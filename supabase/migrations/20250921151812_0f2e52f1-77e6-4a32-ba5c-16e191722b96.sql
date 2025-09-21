BEGIN;

-- Add the new logic gate module to allowed module IDs
ALTER TABLE public.module_completion
  DROP CONSTRAINT IF EXISTS module_completion_module_id_check;

ALTER TABLE public.module_completion
  ADD CONSTRAINT module_completion_module_id_check
  CHECK (module_id IN (
    'photosynthesis_6',
    'circuit_builder_6',
    'shape_builder_6',
    'number_adventure_6',
    'logic_gate_6'
  ));

-- Add the new Logic Tinkerer badge to allowed badge names
ALTER TABLE public.badges
  DROP CONSTRAINT IF EXISTS badges_badge_name_check;

ALTER TABLE public.badges
  ADD CONSTRAINT badges_badge_name_check
  CHECK (badge_name IN (
    'Photosynthesis Master',
    'Circuit Master',
    'Shape Genius',
    'Number Explorer',
    'Code Pathfinder',
    'Logic Tinkerer'
  ));

COMMIT;