import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  class: number;
  preferred_language: 'english' | 'odia';
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_streak: number;
  total_credits: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_name: string;
  module_name: string;
  earned_date: string;
}

interface UserStore {
  profile: UserProfile | null;
  progress: UserProgress | null;
  badges: Badge[];
  language: 'english' | 'odia';
  loading: boolean;
  
  // Actions
  setLanguage: (lang: 'english' | 'odia') => void;
  fetchUserData: (userId: string) => Promise<void>;
  updateProgress: (xp: number, credits: number) => Promise<void>;
  addBadge: (badgeName: string, moduleName: string) => Promise<void>;
  updateStreak: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  progress: null,
  badges: [],
  language: 'english',
  loading: false,

  setLanguage: (lang) => {
    set({ language: lang });
    // Update user preference in database
    const profile = get().profile;
    if (profile) {
      supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('user_id', profile.user_id);
    }
  },

  fetchUserData: async (userId: string) => {
    set({ loading: true });
    
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      set({
        profile: profile as UserProfile | null,
        progress: progress || null,
        badges: badges || [],
        language: (profile?.preferred_language as 'english' | 'odia') || 'english',
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ loading: false });
    }
  },

  updateProgress: async (xp: number, credits: number) => {
    const { progress } = get();
    if (!progress) return;

    const newXp = progress.total_xp + xp;
    const newCredits = progress.total_credits + credits;

    const { data } = await supabase
      .from('user_progress')
      .update({
        total_xp: newXp,
        total_credits: newCredits,
      })
      .eq('user_id', progress.user_id)
      .select()
      .single();

    if (data) {
      set({
        progress: data,
      });
    }
  },

  addBadge: async (badgeName: string, moduleName: string) => {
    const { profile, badges } = get();
    if (!profile) return;

    // Check if badge already exists
    const exists = badges.some(
      (badge) => badge.badge_name === badgeName && badge.module_name === moduleName
    );

    if (exists) return;

    const { data } = await supabase
      .from('badges')
      .insert({
        user_id: profile.user_id,
        badge_name: badgeName,
        module_name: moduleName,
      })
      .select()
      .single();

    if (data) {
      set({
        badges: [data, ...badges],
      });
    }
  },

  updateStreak: async () => {
    const { progress } = get();
    if (!progress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = progress.last_login;
    
    let newStreak = progress.current_streak;
    
    if (!lastLogin) {
      newStreak = 1;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastLogin === yesterdayStr) {
        newStreak += 1;
      } else if (lastLogin !== today) {
        newStreak = 1;
      }
    }

    const { data } = await supabase
      .from('user_progress')
      .update({
        current_streak: newStreak,
        last_login: today,
      })
      .eq('user_id', progress.user_id)
      .select()
      .single();

    if (data) {
      set({ progress: data });
    }
  },
}));