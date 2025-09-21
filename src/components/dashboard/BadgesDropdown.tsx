import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Lock, Star, Award, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BadgeDefinition {
  name: string;
  module: string;
  subject: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const ALL_BADGES: BadgeDefinition[] = [
  // Class 6 Science
  {
    name: 'Photosynthesis Master',
    module: 'Class 6 Science',
    subject: 'Science',
    description: 'Mastered the photosynthesis process',
    icon: Star,
    color: 'text-green-500'
  },
  // Class 6 Engineering
  {
    name: 'Circuit Master',
    module: 'Class 6 Engineering',
    subject: 'Engineering',
    description: 'Built working electrical circuits',
    icon: Zap,
    color: 'text-yellow-500'
  },
  // Class 6 Mathematics
  {
    name: 'Number Explorer',
    module: 'number_adventure_6',
    subject: 'Mathematics',
    description: 'Explored mathematical concepts',
    icon: Award,
    color: 'text-blue-500'
  },
  {
    name: 'Shape Genius',
    module: 'shape_builder_6',
    subject: 'Mathematics',
    description: 'Master of geometric shapes',
    icon: Trophy,
    color: 'text-purple-500'
  },
  // Class 6 Technology
  {
    name: 'Logic Tinkerer',
    module: 'logic_gate_6',
    subject: 'Technology',
    description: 'Master of digital logic and circuit building',
    icon: Zap,
    color: 'text-cyan-500'
  },
  // Class 12 Mathematics
  {
    name: 'Dice Strategist',
    module: 'Class 12 Mathematics',
    subject: 'Mathematics',
    description: 'Master of probability with dice',
    icon: Award,
    color: 'text-red-500'
  },
  {
    name: 'Card Conqueror',
    module: 'Class 12 Mathematics',
    subject: 'Mathematics',
    description: 'Expert in card probability',
    icon: Trophy,
    color: 'text-orange-500'
  },
  {
    name: 'Coin Commander',
    module: 'Class 12 Mathematics',
    subject: 'Mathematics',
    description: 'Commander of coin flip probability',
    icon: Star,
    color: 'text-amber-500'
  },
  {
    name: 'Probability Monarch',
    module: 'Class 12 Mathematics',
    subject: 'Mathematics',
    description: 'Ultimate ruler of probability kingdom',
    icon: Award,
    color: 'text-violet-500'
  },
  // Class 12 Chemistry
  {
    name: 'Aldol Alchemist',
    module: 'Class 12 Chemistry',
    subject: 'Chemistry',
    description: 'Master of organic reactions',
    icon: Zap,
    color: 'text-emerald-500'
  },
  // Class 12 Technology
  {
    name: 'IoT Architect',
    module: 'IoT Smart City Simulator',
    subject: 'Technology',
    description: 'Expert in IoT network design',
    icon: Star,
    color: 'text-blue-600'
  },
  {
    name: 'Data Detective',
    module: 'SQL Data Dungeon',
    subject: 'Technology',
    description: 'Expert at finding data with SELECT queries',
    icon: Award,
    color: 'text-indigo-500'
  },
  {
    name: 'Insert Wizard',
    module: 'SQL Data Dungeon',
    subject: 'Technology',
    description: 'Master of INSERT operations',
    icon: Zap,
    color: 'text-purple-500'
  },
  {
    name: 'Data Slayer',
    module: 'SQL Data Dungeon',
    subject: 'Technology',
    description: 'Expert at removing data with DELETE',
    icon: Trophy,
    color: 'text-red-600'
  },
  {
    name: 'Query Conqueror',
    module: 'SQL Data Dungeon',
    subject: 'Technology',
    description: 'Ultimate SQL master with UPDATE skills',
    icon: Star,
    color: 'text-gold-500'
  },
  // Class 12 Engineering
  {
    name: 'Disaster Engineer',
    module: 'Disaster-Resilient City Builder',
    subject: 'Engineering',
    description: 'Expert in disaster-resilient city design',
    icon: Award,
    color: 'text-orange-600'
  }
];

export const BadgesDropdown: React.FC = () => {
  const { badges, language, fetchUserData } = useUserStore();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Listen for real-time badge updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('badge_updates')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'badges', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          console.log('Real-time badge update received:', payload);
          // Refresh user data to get updated badges
          fetchUserData(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserData]);

  // Get achieved badge names for comparison
  const achievedBadges = badges.map(badge => badge.badge_name);
  const achievedCount = achievedBadges.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-badge" />
          <span className="font-medium">
            {language === 'odia' ? 'ବ୍ୟାଜ୍ ସଂଗ୍ରହ' : 'Badge Collection'}
          </span>
          <Badge variant="secondary" className="ml-2">
            {achievedCount}/{totalBadges}
          </Badge>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="shadow-lg border-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="font-semibold text-sm">
                      {language === 'odia' ? 'ସମସ୍ତ ବ୍ୟାଜ୍' : 'All Badges'}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {language === 'odia' 
                        ? `${achievedCount} ଅର୍ଜିତ` 
                        : `${achievedCount} Earned`
                      }
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ALL_BADGES.map((badgeDefinition) => {
                      const isAchieved = achievedBadges.includes(badgeDefinition.name);
                      const IconComponent = badgeDefinition.icon;

                      return (
                        <motion.div
                          key={badgeDefinition.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                            isAchieved 
                              ? "bg-primary/5 border-primary/20 shadow-sm" 
                              : "bg-muted/30 border-border/40"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-full transition-all",
                            isAchieved 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {isAchieved ? (
                              <IconComponent className={cn("h-4 w-4", badgeDefinition.color)} />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                isAchieved ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {badgeDefinition.name}
                              </p>
                              {isAchieved && (
                                <Badge variant="default" className="text-xs px-2 py-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {badgeDefinition.subject} • {badgeDefinition.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {achievedCount === totalBadges && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
                      <p className="text-sm font-medium text-primary">
                        {language === 'odia' 
                          ? 'ସମସ୍ତ ବ୍ୟାଜ୍ ସଂଗ୍ରହ ସମ୍ପୂର୍ଣ୍ଣ!' 
                          : 'All Badges Collected!'
                        }
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};