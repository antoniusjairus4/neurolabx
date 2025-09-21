-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class INTEGER NOT NULL CHECK (class >= 6 AND class <= 12),
  preferred_language TEXT NOT NULL DEFAULT 'english' CHECK (preferred_language IN ('english', 'odia')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table for gamification
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_credits INTEGER NOT NULL DEFAULT 0,
  last_login DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL CHECK (badge_name IN ('Photosynthesis Master', 'Molecular Builder', 'Science Explorer', 'Math Wizard', 'Tech Pioneer', 'Engineering Expert')),
  module_name TEXT NOT NULL,
  earned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_name, module_name)
);

-- Create module_completion table
CREATE TABLE public.module_completion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL CHECK (module_id IN ('photosynthesis_6', 'molecular_builder_8')),
  completion_status TEXT NOT NULL DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create molecule_attempts table for tracking molecular builder attempts
CREATE TABLE public.molecule_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  molecule_type TEXT NOT NULL CHECK (molecule_type IN ('H2O', 'CO2', 'CH4', 'NH3', 'O2')),
  success BOOLEAN NOT NULL DEFAULT false,
  attempt_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spin_wheel table for daily rewards
CREATE TABLE public.spin_wheel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_spin DATE,
  rewards_claimed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.molecule_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for badges
CREATE POLICY "Users can view their own badges" ON public.badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badges" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for module_completion
CREATE POLICY "Users can view their own module completion" ON public.module_completion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own module completion" ON public.module_completion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completion" ON public.module_completion
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for molecule_attempts
CREATE POLICY "Users can view their own molecule attempts" ON public.molecule_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own molecule attempts" ON public.molecule_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for spin_wheel
CREATE POLICY "Users can view their own spin wheel data" ON public.spin_wheel
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spin wheel data" ON public.spin_wheel
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spin wheel data" ON public.spin_wheel
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, class, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE((NEW.raw_user_meta_data->>'class')::integer, 6),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'english')
  );
  
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.spin_wheel (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_completion_updated_at
  BEFORE UPDATE ON public.module_completion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spin_wheel_updated_at
  BEFORE UPDATE ON public.spin_wheel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();