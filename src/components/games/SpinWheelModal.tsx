import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift, Zap, Trophy, BookOpen, X } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  nameOdia: string;
  type: 'xp' | 'credits' | 'badge';
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'english' | 'odia';
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const { user } = useAuth();
  const { updateProgress, addBadge } = useUserStore();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [rotation, setRotation] = useState(0);

  const rewards: Reward[] = [
    {
      id: 'xp_10',
      name: '10 XP',
      nameOdia: '୧୦ XP',
      type: 'xp',
      value: 10,
      icon: Zap,
      color: 'text-xp',
    },
    {
      id: 'credits_5',
      name: '5 Credits',
      nameOdia: '୫ କ୍ରେଡିଟ',
      type: 'credits',
      value: 5,
      icon: Gift,
      color: 'text-credits',
    },
    {
      id: 'xp_25',
      name: '25 XP',
      nameOdia: '୨୫ XP',
      type: 'xp',
      value: 25,
      icon: Zap,
      color: 'text-xp',
    },
    {
      id: 'badge_daily',
      name: 'Daily Spinner',
      nameOdia: 'ଦୈନିକ ସ୍ପିନର',
      type: 'badge',
      value: 1,
      icon: Trophy,
      color: 'text-badge',
    },
    {
      id: 'xp_15',
      name: '15 XP',
      nameOdia: '୧୫ XP',
      type: 'xp',
      value: 15,
      icon: Zap,
      color: 'text-xp',
    },
    {
      id: 'credits_10',
      name: '10 Credits',
      nameOdia: '୧୦ କ୍ରେଡିଟ',
      type: 'credits',
      value: 10,
      icon: Gift,
      color: 'text-credits',
    },
  ];

  const checkSpinAvailability = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('spin_wheel')
        .select('last_spin')
        .eq('user_id', user.id)
        .single();

      if (data?.last_spin) {
        const lastSpin = new Date(data.last_spin);
        const today = new Date();
        const isSameDay = lastSpin.toDateString() === today.toDateString();
        setCanSpin(!isSameDay);
      }
    } catch (error) {
      console.error('Error checking spin availability:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkSpinAvailability();
    }
  }, [isOpen, user]);

  const handleSpin = async () => {
    if (!canSpin || isSpinning || !user) return;

    setIsSpinning(true);
    
    // Random reward selection
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const selectedReward = rewards[randomIndex];
    
    // Calculate rotation (multiple full spins + final position)
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = (randomIndex * 60) + (360 * spins); // 60 degrees per segment
    
    setRotation(finalRotation);

    // Wait for spin animation to complete
    setTimeout(async () => {
      setWonReward(selectedReward);
      
      // Award the reward
      try {
        if (selectedReward.type === 'xp') {
          await updateProgress(selectedReward.value, 0);
        } else if (selectedReward.type === 'credits') {
          await updateProgress(0, selectedReward.value);
        } else if (selectedReward.type === 'badge') {
          await addBadge(selectedReward.name, 'Daily Rewards');
        }

        // Update spin wheel data
        await supabase
          .from('spin_wheel')
          .update({
            last_spin: new Date().toISOString().split('T')[0],
            rewards_claimed: [selectedReward.id]
          })
          .eq('user_id', user.id);

        setCanSpin(false);
        
        toast({
          title: language === 'odia' ? 'ପୁରସ୍କାର ଜିତିଲେ!' : 'Reward Won!',
          description: `${language === 'odia' ? 'ଆପଣ ଜିତିଲେ' : 'You won'} ${language === 'odia' ? selectedReward.nameOdia : selectedReward.name}!`,
        });
      } catch (error) {
        console.error('Error awarding reward:', error);
        toast({
          title: language === 'odia' ? 'ତ୍ରୁଟି' : 'Error',
          description: language === 'odia' ? 'ପୁରସ୍କାର ଦେବାରେ ସମସ୍ୟା' : 'Failed to award reward',
          variant: 'destructive',
        });
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  const handleClose = () => {
    if (!isSpinning) {
      setWonReward(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === 'odia' ? 'ଦୈନିକ ସ୍ପିନ୍ ଚକ' : 'Daily Spin Wheel'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {canSpin 
              ? (language === 'odia' ? 'ଆଜି ଆପଣଙ୍କର ମାଗଣା ସ୍ପିନ୍!' : 'Your free spin for today!')
              : (language === 'odia' ? 'କାଲି ଫେରିଯାଅ' : 'Come back tomorrow!')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Spin Wheel */}
          <div className="relative">
            <motion.div
              className="w-48 h-48 rounded-full border-4 border-primary relative overflow-hidden"
              animate={{ rotate: rotation }}
              transition={{ 
                duration: isSpinning ? 3 : 0, 
                ease: isSpinning ? "easeOut" : "linear" 
              }}
            >
              {rewards.map((reward, index) => (
                <div
                  key={reward.id}
                  className={`absolute w-full h-full`}
                  style={{
                    transform: `rotate(${index * 60}deg)`,
                    clipPath: 'polygon(50% 50%, 50% 0%, 93.3% 25%)',
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-r ${
                    index % 2 === 0 ? 'from-primary/20 to-primary/10' : 'from-secondary/20 to-secondary/10'
                  } flex items-start justify-center pt-4`}>
                    <div className="flex flex-col items-center text-xs">
                      <reward.icon className={`h-4 w-4 ${reward.color} mb-1`} />
                      <span className="font-semibold text-center leading-tight">
                        {language === 'odia' ? reward.nameOdia : reward.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            
            {/* Center pointer */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full border-4 border-background z-10" />
            
            {/* Top indicator */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary" />
          </div>

          {/* Spin Button */}
          <Button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className="w-32 h-12 text-lg font-bold"
            size="lg"
          >
            {isSpinning 
              ? (language === 'odia' ? 'ସ୍ପିନ୍ ହେଉଛି...' : 'Spinning...') 
              : (language === 'odia' ? 'ସ୍ପିନ୍!' : 'Spin!')
            }
          </Button>

          {/* Status Message */}
          {!canSpin && !isSpinning && (
            <p className="text-sm text-muted-foreground text-center">
              {language === 'odia' 
                ? 'ଆପଣ ଆଜି ସ୍ପିନ୍ କରିସାରିଛନ୍ତି। କାଲି ଫେରିଯାଅ!'
                : 'You\'ve already spun today. Come back tomorrow!'
              }
            </p>
          )}
        </div>

        {/* Reward Display */}
        <AnimatePresence>
          {wonReward && (
            <motion.div
              className="mt-4 p-4 bg-gradient-to-r from-badge/10 to-xp/10 rounded-lg border border-primary/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3">
                <wonReward.icon className={`h-6 w-6 ${wonReward.color}`} />
                <div className="text-center">
                  <p className="font-bold">
                    {language === 'odia' ? 'ଆପଣ ଜିତିଲେ!' : 'You Won!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'odia' ? wonReward.nameOdia : wonReward.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};