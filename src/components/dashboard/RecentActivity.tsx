import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/userStore';
import { Trophy, Zap, Calendar } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const { badges, language } = useUserStore();

  // Mock recent activities - in a real app, this would come from the database
  const activities = [
    {
      id: 1,
      type: 'badge',
      title: language === 'odia' ? 'ନୂତନ ବ୍ୟାଜ୍ ଅର୍ଜନ' : 'New Badge Earned',
      description: badges[0]?.badge_name || (language === 'odia' ? 'ପ୍ରଥମ ବ୍ୟାଜ୍' : 'First Badge'),
      time: '2 hours ago',
      timeOdia: '୨ ଘଣ୍ଟା ପୂର୍ବେ',
      icon: Trophy,
      color: 'badge',
    },
    {
      id: 2,
      type: 'xp',
      title: language === 'odia' ? 'XP ଅର୍ଜନ' : 'XP Gained',
      description: language === 'odia' ? '୧୦୦ XP ଅର୍ଜନ କରିଛନ୍ତି' : 'Earned 100 XP',
      time: '1 day ago',
      timeOdia: '୧ ଦିନ ପୂର୍ବେ',
      icon: Zap,
      color: 'xp',
    },
    {
      id: 3,
      type: 'streak',
      title: language === 'odia' ? 'ଧାରା ଜାରି' : 'Streak Maintained',
      description: language === 'odia' ? '୫ ଦିନ ଧାରା' : '5 day streak',
      time: '2 days ago',
      timeOdia: '୨ ଦିନ ପୂର୍ବେ',
      icon: Calendar,
      color: 'streak',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'odia' ? 'ସମ୍ପ୍ରତି କାର୍ଯ୍ୟକଳାପ' : 'Recent Activity'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {language === 'odia' 
                ? 'ଆରମ୍ଭ କରିବା ପାଇଁ ଏକ ମଡ୍ୟୁଲ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ'
                : 'Complete a module to get started'
              }
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`p-2 rounded-lg bg-${activity.color}/10 text-${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'odia' ? activity.timeOdia : activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};