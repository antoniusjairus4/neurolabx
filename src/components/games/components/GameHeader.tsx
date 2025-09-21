import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Brain } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  xp: number;
  onBack: () => void;
  language: 'english' | 'odia';
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  xp,
  onBack,
  language,
}) => {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Back button and title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === 'odia' ? 'ପଛକୁ' : 'Back'}
              </span>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-science/10 text-science">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'odia' ? 'କ୍ଲାସ ୬ ବିଜ୍ଞାନ' : 'Class 6 Science'}
                </p>
              </div>
            </div>
          </div>

          {/* Right section - XP display */}
          <div className="flex items-center gap-3">
            <motion.div
              key={xp}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              <Badge variant="secondary" className="gap-2 bg-xp/10 text-xp border-xp/20">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">{xp} XP</span>
              </Badge>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};