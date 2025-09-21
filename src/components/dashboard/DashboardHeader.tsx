import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { Brain, Sun, Moon, Globe, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

export const DashboardHeader: React.FC = () => {
  const { signOut } = useAuth();
  const { profile, language, setLanguage } = useUserStore();
  const { theme, setTheme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const baseGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    
    if (language === 'odia') {
      return hour < 12 ? 'ସୁପ୍ରଭାତ' : hour < 17 ? 'ନମସ୍କାର' : 'ସୁସନ୍ଧ୍ୟା';
    }
    
    return baseGreeting;
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Greeting */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NeuroQuest</h1>
                <p className="text-sm text-muted-foreground">
                  {getGreeting()}, {profile?.name || 'Student'}!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'english' ? 'odia' : 'english')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === 'english' ? 'EN' : 'ଓଡ଼'}
              </span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === 'odia' ? 'ବାହାରି ଯାଇ' : 'Sign Out'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};