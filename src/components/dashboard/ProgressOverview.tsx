import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/userStore';
import { Trophy, Zap, Flame, Coins } from 'lucide-react';

export const ProgressOverview: React.FC = () => {
  const { progress, badges, language } = useUserStore();

  const getLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  const getXpForNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    return currentLevel * 1000;
  };

  const stats = [
    {
      title: language === 'odia' ? 'ମୋଟ XP' : 'Total XP',
      value: progress?.total_xp || 0,
      icon: Zap,
      color: 'xp',
      description: language === 'odia' ? `ସ୍ତର ${getLevel(progress?.total_xp || 0)}` : `Level ${getLevel(progress?.total_xp || 0)}`,
    },
    {
      title: language === 'odia' ? 'ବ୍ୟାଜ୍' : 'Badges',
      value: badges.length,
      icon: Trophy,
      color: 'badge',
      description: language === 'odia' ? 'ଅର୍ଜିତ' : 'Earned',
    },
    {
      title: language === 'odia' ? 'ଧାରା' : 'Streak',
      value: progress?.current_streak || 0,
      icon: Flame,
      color: 'streak',
      description: language === 'odia' ? 'ଦିନ' : 'Days',
    },
    {
      title: language === 'odia' ? 'କ୍ରେଡିଟ୍' : 'Credits',
      value: progress?.total_credits || 0,
      icon: Coins,
      color: 'credit',
      description: language === 'odia' ? 'ସଂଗୃହୀତ' : 'Collected',
    },
  ];

  const currentXp = progress?.total_xp || 0;
  const nextLevelXp = getXpForNextLevel(currentXp);
  const currentLevelXp = (getLevel(currentXp) - 1) * 1000;
  const progressPercentage = ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-xp" />
            {language === 'odia' ? 'ସ୍ତରীକରଣ ପ୍ରଗତି' : 'Level Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-xp">
                {language === 'odia' ? 'ସ୍ତର' : 'Level'} {getLevel(currentXp)}
              </span>
              <span className="text-sm text-muted-foreground">
                {currentXp} / {nextLevelXp} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {language === 'odia' 
                ? `ପରବର୍ତ୍ତୀ ସ୍ତର ପାଇଁ ${nextLevelXp - currentXp} XP ଆବଶ୍ୟକ`
                : `${nextLevelXp - currentXp} XP needed for next level`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}/10 text-${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-badge" />
              {language === 'odia' ? 'ସମ୍ପ୍ରତି ଅର୍ଜିତ ବ୍ୟାଜ୍' : 'Recent Badges'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className="bg-badge/10 text-badge border-badge/20"
                >
                  {badge.badge_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};