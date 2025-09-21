import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Spade, Heart, Diamond, Club, Coins, Crown, Castle, Shield } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  nameOdia: string;
  question: string;
  questionOdia: string;
  options: string[];
  correct: string;
  xpReward: number;
  badge: string;
  visual: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface GameState {
  currentZone: number;
  completedZones: string[];
  totalXp: number;
  completed: boolean;
}

export const ProbabilityKingdomGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge } = useUserStore();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>({
    currentZone: 0,
    completedZones: [],
    totalXp: 0,
    completed: false,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [buildingAnimation, setBuildingAnimation] = useState(false);

  const zones: Zone[] = [
    {
      id: 'dice-dungeon',
      name: 'Dice Dungeon',
      nameOdia: 'ପାସା ଗୁମ୍ଫା',
      question: 'What is the probability of rolling a sum of 7 with two dice?',
      questionOdia: 'ଦୁଇଟି ପାସା ସହିତ 7 ର ଯୋଗଫଳ ପାଇବାର ସମ୍ଭାବନା କେତେ?',
      options: ['1/6', '1/8', '1/12'],
      correct: '1/6',
      xpReward: 15,
      badge: 'Dice Strategist',
      visual: 'castle wall constructed',
      completed: false,
      icon: <Dice1 className="h-8 w-8" />,
    },
    {
      id: 'card-court',
      name: 'Card Court',
      nameOdia: 'କାର୍ଡ ଦରବାର',
      question: 'What is the probability of drawing a red queen from a standard deck?',
      questionOdia: 'ଏକ ମାନକ ଡେକରୁ ଲାଲ ରାଣୀ ଟାଣିବାର ସମ୍ଭାବନା କେତେ?',
      options: ['1/13', '1/26', '1/52'],
      correct: '1/26',
      xpReward: 15,
      badge: 'Card Conqueror',
      visual: 'guard tower unlocked',
      completed: false,
      icon: <Heart className="h-8 w-8 text-red-500" />,
    },
    {
      id: 'coin-citadel',
      name: 'Coin Citadel',
      nameOdia: 'ମୁଦ୍ରା ଦୁର୍ଗ',
      question: 'If you toss 3 coins, what is the probability of getting exactly two heads?',
      questionOdia: '3ଟି ମୁଦ୍ରା ଟସ୍ କଲେ, ଠିକ୍ ଦୁଇଟି ଚିତ୍ ପାଇବାର ସମ୍ଭାବନା କେତେ?',
      options: ['3/8', '1/4', '1/2'],
      correct: '3/8',
      xpReward: 15,
      badge: 'Coin Commander',
      visual: 'throne hall expanded',
      completed: false,
      icon: <Coins className="h-8 w-8 text-yellow-500" />,
    },
  ];

  const currentZone = zones[gameState.currentZone];
  const progress = (gameState.completedZones.length / zones.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentZone) return;

    const isCorrect = selectedAnswer === currentZone.correct;

    if (isCorrect) {
      setBuildingAnimation(true);
      setFeedback(language === 'odia' ? 'ସଠିକ୍! ତୁମର ରାଜ୍ୟ ଅଧିକ ଶକ୍ତିଶାଳୀ ହେଉଛି।' : 'Correct! Your kingdom grows stronger.');

      const newCompletedZones = [...gameState.completedZones, currentZone.id];
      const newTotalXp = gameState.totalXp + currentZone.xpReward;
      const isGameCompleted = newCompletedZones.length === zones.length;

      setGameState(prev => ({
        ...prev,
        completedZones: newCompletedZones,
        totalXp: newTotalXp,
        completed: isGameCompleted,
      }));

      toast({
        title: language === 'odia' ? 'ସଫଳ!' : 'Success!',
        description: language === 'odia' ? 'ସଠିକ୍ ଉତ୍ତର!' : 'Correct answer!',
      });

      // Update progress and badges
      if (user) {
        await updateProgress(currentZone.xpReward, 0);
        await addBadge(currentZone.badge, 'Class 12 Mathematics');

        // Update module completion
        if (isGameCompleted) {
          await addBadge('Probability Monarch', 'Class 12 Mathematics');
          await updateProgress(60, 0); // Final completion bonus

          const { error } = await supabase
            .from('module_completion')
            .upsert({
              user_id: user.id,
              module_id: 'probability-kingdom-grade-12',
              completion_status: 'completed',
              xp_earned: newTotalXp + 60,
              best_score: 100,
              attempts: 1,
            });

          if (error) {
            console.error('Error updating module completion:', error);
          }
        }
      }

      setTimeout(() => {
        setBuildingAnimation(false);
        setFeedback(null);
        setSelectedAnswer(null);

        if (isGameCompleted) {
          setShowCompletion(true);
        } else {
          setGameState(prev => ({ ...prev, currentZone: prev.currentZone + 1 }));
        }
      }, 2000);
    } else {
      setFeedback(language === 'odia' ? 'ଭୁଲ। ପୁଣି ଚିନ୍ତା କରି ଚେଷ୍ଟା କର।' : 'Incorrect. Think again and try once more.');
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
      }, 2000);
    }
  };

  const handleRestart = () => {
    setGameState({
      currentZone: 0,
      completedZones: [],
      totalXp: 0,
      completed: false,
    });
    setSelectedAnswer(null);
    setShowCompletion(false);
    setFeedback(null);
  };

  const getZoneIcon = (zone: Zone, index: number) => {
    const isCompleted = gameState.completedZones.includes(zone.id);
    const isCurrent = index === gameState.currentZone && !gameState.completed;
    
    return (
      <motion.div
        className={`relative p-4 rounded-full ${
          isCompleted 
            ? 'bg-gradient-to-br from-math/20 to-math/30 border-2 border-math/40' 
            : isCurrent 
            ? 'bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-primary/40' 
            : 'bg-muted/20 border-2 border-muted/30'
        }`}
        animate={isCurrent ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
      >
        {zone.icon}
        {isCompleted && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Crown className="h-4 w-4 text-math" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-math/5">
      <GameHeader 
        title={language === 'odia' ? 'ସମ୍ଭାବନା ରାଜ୍ୟ' : 'Probability Kingdom'}
        subject="Mathematics"
        language={language}
        xp={gameState.totalXp}
        onBack={() => window.history.back()}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Kingdom Map */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'odia' ? 'ତୁମର ରାଜ୍ୟ' : 'Your Kingdom'}
            </h2>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-math/10 text-math border-math/20">
                {language === 'odia' ? `XP: ${gameState.totalXp}` : `XP: ${gameState.totalXp}`}
              </Badge>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Zone Map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {zones.map((zone, index) => (
              <motion.div
                key={zone.id}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                {getZoneIcon(zone, index)}
                <h3 className="mt-4 font-semibold text-foreground">
                  {language === 'odia' ? zone.nameOdia : zone.name}
                </h3>
                {gameState.completedZones.includes(zone.id) && (
                  <motion.p
                    className="text-sm text-math mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {language === 'odia' ? 'সম্পূর্ণ!' : 'Complete!'}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Challenge */}
        {!gameState.completed && currentZone && (
          <Card className="mb-8 border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {language === 'odia' ? currentZone.nameOdia : currentZone.name}
                </h3>
                <div className="flex justify-center mb-4">
                  {currentZone.icon}
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                <h4 className="text-lg font-semibold text-foreground mb-6 text-center">
                  {language === 'odia' ? currentZone.questionOdia : currentZone.question}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentZone.options.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className="w-full h-16 text-lg"
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!!feedback}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || !!feedback}
                    className="px-8 py-3 text-lg"
                  >
                    {language === 'odia' ? 'ଉତ୍ତର ଦିଅ' : 'Submit Answer'}
                  </Button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <p className={`text-lg font-semibold ${
                        feedback.includes('Correct') || feedback.includes('ସଠିକ୍') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {feedback}
                      </p>
                      {buildingAnimation && (
                        <motion.div
                          className="mt-4 flex justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 1 }}
                        >
                          <Castle className="h-12 w-12 text-math" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Modal */}
        <AnimatePresence>
          {showCompletion && (
            <CompletionModal
              isOpen={showCompletion}
              onClose={() => setShowCompletion(false)}
              onPlayAgain={handleRestart}
              onReturnHome={() => window.history.back()}
              xpEarned={gameState.totalXp + 60}
              badgeName="Probability Monarch"
              language={language}
              gameName="Probability Kingdom"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};