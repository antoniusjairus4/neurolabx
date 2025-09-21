import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Lock, Star, Award, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
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
  {
    name: 'Photosynthesis Master',
    module: 'Class 6 Science',
    subject: 'Science',
    description: 'Mastered the photosynthesis process',
    icon: Star,
    color: 'text-green-500'
  },
  {
    name: 'Circuit Master',
    module: 'Class 6 Engineering',
    subject: 'Engineering',
    description: 'Built working electrical circuits',
    icon: Zap,
    color: 'text-yellow-500'
  },
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
  {
    name: 'Code Pathfinder',
    module: 'algorithm_adventure',
    subject: 'Technology',
    description: 'Guided robot through algorithmic challenges',
    icon: Star,
    color: 'text-indigo-500'
  }
];

export const BadgesDropdown: React.FC = () => {
  const { badges, language } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

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