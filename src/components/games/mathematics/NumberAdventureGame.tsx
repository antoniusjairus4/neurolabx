import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { MapPin, Trophy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  questionOdia: string;
  options: string[];
  correct: string;
  feedback: string;
  feedbackOdia: string;
  xpReward: number;
  completed: boolean;
}

export const NumberAdventureGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge, fetchUserData } = useUserStore();
  const { toast } = useToast();

  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: '12 + 8 = ?',
      questionOdia: '12 + 8 = ?',
      options: ['18', '20', '22'],
      correct: '20',
      feedback: 'Correct! Path unlocked to the next checkpoint.',
      feedbackOdia: 'ସଠିକ୍! ପରବର୍ତ୍ତୀ ଚେକପଏଣ୍ଟକୁ ପଥ ଖୋଲାଗଲା।',
      xpReward: 10,
      completed: false
    },
    {
      id: 2,
      question: '15 - 7 = ?',
      questionOdia: '15 - 7 = ?',
      options: ['8', '9', '7'],
      correct: '8',
      feedback: 'Correct! Bridge built to the next stage.',
      feedbackOdia: 'ସଠିକ୍! ପରବର୍ତ୍ତୀ ପର୍ଯ୍ୟାୟକୁ ସେତୁ ନିର୍ମାଣ ହେଲା।',
      xpReward: 10,
      completed: false
    },
    {
      id: 3,
      question: '6 × 4 = ?',
      questionOdia: '6 × 4 = ?',
      options: ['24', '20', '18'],
      correct: '24',
      feedback: 'Correct! Treasure chest opened.',
      feedbackOdia: 'ସଠିକ୍! ଧନ ସନ୍ଦୁକ ଖୋଲାଗଲା।',
      xpReward: 10,
      completed: false
    }
  ]);

  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    totalXp: 0,
    completed: false,
    questionsAnswered: [] as number[]
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = questions[gameState.currentQuestion];
  const progress = (gameState.questionsAnswered.length / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQ.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setGameState(prev => ({
        ...prev,
        totalXp: prev.totalXp + currentQ.xpReward,
        questionsAnswered: [...prev.questionsAnswered, currentQ.id]
      }));

      toast({
        title: language === 'odia' ? 'ସଠିକ୍!' : 'Correct!',
        description: language === 'odia' ? currentQ.feedbackOdia : currentQ.feedback,
      });

      setTimeout(() => {
        if (gameState.currentQuestion < questions.length - 1) {
          setGameState(prev => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1
          }));
          setShowFeedback(false);
          setSelectedAnswer('');
        } else {
          // Game completed
          handleGameCompletion();
        }
      }, 2000);
    } else {
      toast({
        title: language === 'odia' ? 'ଭୁଲ୍!' : 'Wrong!',
        description: language === 'odia' ? 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Try again.',
        variant: 'destructive'
      });

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer('');
      }, 1500);
    }
  };

  const handleGameCompletion = async () => {
    if (!user) return;

    setGameState(prev => ({ ...prev, completed: true }));

    try {
      // Check existing completion to get attempt count
      const { data: existingCompletion } = await supabase
        .from('module_completion')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', 'number_adventure_6')
        .maybeSingle();

      const finalXp = gameState.totalXp + 20;
      const completionData = {
        completion_status: 'completed' as const,
        xp_earned: finalXp,
        attempts: (existingCompletion?.attempts || 0) + 1,
        best_score: Math.max(existingCompletion?.best_score || 0, 100),
      };

      if (existingCompletion) {
        await supabase
          .from('module_completion')
          .update(completionData)
          .eq('user_id', user.id)
          .eq('module_id', 'number_adventure_6');
      } else {
        await supabase
          .from('module_completion')
          .insert({ user_id: user.id, module_id: 'number_adventure_6', ...completionData });
      }

      // Update user progress in store
      await updateProgress(finalXp, 0);
      
      // Add badge
      await addBadge('Number Explorer', 'number_adventure_6');

      // Refresh user data to update dashboard
      await fetchUserData(user.id);

      setShowCompletion(true);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getMapPosition = (index: number) => {
    const positions = [
      { top: '10%', left: '20%' },
      { top: '40%', left: '50%' },
      { top: '70%', left: '80%' }
    ];
    return positions[index] || positions[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <GameHeader
        title={language === 'odia' ? 'ସଂଖ୍ୟା ଦୁଃସାହସିକ କାର୍ଯ୍ୟ' : 'Number Adventure'}
        xp={gameState.totalXp}
        onBack={() => window.history.back()}
        language={language}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}: {Math.round(progress)}%
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Adventure Map */}
          <Card className="h-[400px]">
            <CardContent className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'odia' ? 'ଦୁଃସାହସିକ ମାନଚିତ୍ର' : 'Adventure Map'}
              </h3>
              <div className="relative h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg border-2 overflow-hidden">
                {/* Forest background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      <pattern id="trees" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <polygon points="25,10 15,40 35,40" fill="currentColor" />
                        <rect x="22" y="35" width="6" height="10" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#trees)" />
                  </svg>
                </div>

                {/* Map checkpoints */}
                {questions.map((q, index) => {
                  const position = getMapPosition(index);
                  const isCompleted = gameState.questionsAnswered.includes(q.id);
                  const isCurrent = index === gameState.currentQuestion;
                  const isLocked = index > gameState.currentQuestion;

                  return (
                    <motion.div
                      key={q.id}
                      className="absolute"
                      style={{ top: position.top, left: position.left }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        isCompleted ? 'bg-green-500 border-green-600 text-white' :
                        isCurrent ? 'bg-blue-500 border-blue-600 text-white animate-pulse' :
                        'bg-gray-300 border-gray-400 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : index === questions.length - 1 ? (
                          <Trophy className="h-6 w-6" />
                        ) : (
                          <MapPin className="h-6 w-6" />
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium text-center whitespace-nowrap">
                        {language === 'odia' ? 'ଚେକପଏଣ୍ଟ' : 'Checkpoint'} {index + 1}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Animated path between checkpoints */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 80 60 Q 200 100 200 180 Q 200 250 320 300"
                    stroke="url(#pathGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10,5"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Question Panel */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'odia' ? 'ଗଣିତ ଚ୍ୟାଲେଞ୍ଜ' : 'Math Challenge'}
              </h3>
              
              <AnimatePresence mode="wait">
                {currentQ && !gameState.completed && (
                  <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <h4 className="text-2xl font-bold mb-2">
                        {language === 'odia' ? currentQ.questionOdia : currentQ.question}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'odia' ? 'ସଠିକ୍ ଉତ୍ତର ବାଛନ୍ତୁ' : 'Choose the correct answer'}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {currentQ.options.map((option) => (
                        <Button
                          key={option}
                          variant={selectedAnswer === option ? (isCorrect ? "default" : "destructive") : "outline"}
                          className="h-14 text-lg justify-center"
                          onClick={() => handleAnswer(option)}
                          disabled={showFeedback}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg text-center ${
                          isCorrect 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        <p className="font-medium">
                          {language === 'odia' ? currentQ.feedbackOdia : currentQ.feedback}
                        </p>
                        {isCorrect && (
                          <p className="text-sm mt-2">
                            +{currentQ.xpReward} XP
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        gameName="Number Adventure"
        onPlayAgain={() => {
          setShowCompletion(false);
          setGameState({
            currentQuestion: 0,
            totalXp: 0,
            completed: false,
            questionsAnswered: []
          });
          setShowFeedback(false);
          setSelectedAnswer('');
        }}
        onReturnHome={() => window.location.href = '/'}
        xpEarned={gameState.totalXp + 20}
        badgeName="Number Explorer"
        language={language}
      />
    </div>
  );
};