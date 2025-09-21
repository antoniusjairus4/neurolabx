import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, BookOpen, Target } from 'lucide-react';
import { SpinWheelModal } from '../games/SpinWheelModal';

export const QuickActions: React.FC = () => {
  const { language } = useUserStore();
  const navigate = useNavigate();
  const [showSpinWheel, setShowSpinWheel] = React.useState(false);

  const actions = [
    {
      title: language === 'odia' ? 'ଶିକ୍ଷା ଜାରି ରଖନ୍ତୁ' : 'Continue Learning',
      description: language === 'odia' ? 'ଶେଷ ମଡ୍ୟୁଲକୁ ଫେରନ୍ତୁ' : 'Return to last module',
      icon: Play,
      action: () => navigate('/learning/science'),
      color: 'primary',
    },
    {
      title: language === 'odia' ? 'ନୂତନ ମଡ୍ୟୁଲ୍' : 'New Module',
      description: language === 'odia' ? 'ନୂତନ ବିଷୟ ଆରମ୍ଭ କରନ୍ତୁ' : 'Start a new topic',
      icon: BookOpen,
      action: () => navigate('/learning'),
      color: 'science',
    },
    {
      title: language === 'odia' ? 'ଦୈନିକ ସ୍ପିନ୍' : 'Daily Spin',
      description: language === 'odia' ? 'ପୁରସ୍କାର ଜିତନ୍ତୁ' : 'Win rewards',
      icon: RotateCcw,
      action: () => setShowSpinWheel(true),
      color: 'badge',
    },
    {
      title: language === 'odia' ? 'ଚ୍ୟାଲେଞ୍ଜ' : 'Challenges',
      description: language === 'odia' ? 'ଦୈନିକ ଲକ୍ଷ୍ୟ' : 'Daily goals',
      icon: Target,
      action: () => {/* TODO: Implement challenges */},
      color: 'engineering',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'odia' ? 'ଦ୍ରୁତ କାର୍ଯ୍ୟ' : 'Quick Actions'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg bg-${action.color}/10 text-${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </CardContent>

      {/* Spin Wheel Modal */}
      <SpinWheelModal
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        language={language}
      />
    </Card>
  );
};