import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, RotateCcw, Home, Sparkles } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onReturnHome: () => void;
  xpEarned: number;
  badgeName: string;
  language: 'english' | 'odia';
  gameName: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  onReturnHome,
  xpEarned,
  badgeName,
  language,
  gameName,
}) => {
  const congratsMessage = language === 'odia' 
    ? `ଅଭିନନ୍ଦନ! ତୁମେ ${gameName} ସଫଳତାର ସହିତ ସମ୍ପୂର୍ଣ୍ଣ କରିଛ।`
    : `Congratulations! You've completed ${gameName} successfully.`;

  const badgeText = language === 'odia' ? 'ବ୍ୟାଜ୍ ଅର୍ଜନ' : 'Badge Earned';
  const xpText = language === 'odia' ? 'XP ଅର୍ଜନ' : 'XP Earned';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Trophy animation */}
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-badge to-badge/70 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Trophy className="h-10 w-10 text-badge-foreground" />
          </motion.div>

          <DialogTitle className="text-2xl font-bold text-center">
            {language === 'odia' ? 'ମিশন সম্পূর্ণ!' : 'Mission Complete!'}
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            {congratsMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Rewards section */}
        <div className="space-y-4 py-4">
          {/* Badge earned */}
          <motion.div
            className="flex items-center justify-between p-4 bg-badge/10 rounded-lg border border-badge/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-badge/20 text-badge">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-badge">{badgeText}</p>
                <p className="text-sm text-muted-foreground">{badgeName}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-badge text-badge-foreground">
              {language === 'odia' ? 'ନୂତନ' : 'New!'}
            </Badge>
          </motion.div>

          {/* XP earned */}
          <motion.div
            className="flex items-center justify-between p-4 bg-xp/10 rounded-lg border border-xp/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xp/20 text-xp">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-xp">{xpText}</p>
                <p className="text-sm text-muted-foreground">
                  +{xpEarned} {language === 'odia' ? 'ପଏଣ୍ଟ' : 'points'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-xp text-xp-foreground font-bold">
              +{xpEarned}
            </Badge>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onPlayAgain}
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {language === 'odia' ? 'ପୁଣି ଖେଳ' : 'Play Again'}
          </Button>
          
          <Button
            onClick={onReturnHome}
            className="flex-1 gap-2"
          >
            <Home className="h-4 w-4" />
            {language === 'odia' ? 'ହୋମ୍' : 'Home'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};