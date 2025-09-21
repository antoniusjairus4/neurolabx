import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GameHeader } from '@/components/games/components/GameHeader';
import { CompletionModal } from '@/components/games/components/CompletionModal';
import { LogicGatesPalette } from '@/components/games/technology/components/LogicGatesPalette';
import { LogicBoard } from '@/components/games/technology/components/LogicBoard';
import { toast } from 'sonner';

interface GameState {
  switchA: boolean;
  switchB: boolean;
  selectedGate: 'AND' | 'OR' | 'NOT' | null;
  bulbLit: boolean;
  xp: number;
  isCompleted: boolean;
}

const initialState: GameState = {
  switchA: false,
  switchB: false,
  selectedGate: null,
  bulbLit: false,
  xp: 0,
  isCompleted: false,
};

export const LogicGateSimulatorClass6: React.FC<{ language: 'english' | 'odia'; onBack: () => void }> = ({
  language,
  onBack,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [showModal, setShowModal] = useState(false);
  const { updateProgress, addBadge } = useUserStore();
  const { user } = useAuth();

  const getCompletion = () => {
    return gameState.selectedGate && gameState.bulbLit ? 100 : 0;
  };

  const checkLogic = (gate: 'AND' | 'OR' | 'NOT' | null, switchA: boolean, switchB: boolean): boolean => {
    if (!gate) return false;
    
    switch (gate) {
      case 'AND':
        return switchA && switchB;
      case 'OR':
        return switchA || switchB;
      case 'NOT':
        return !switchA; // NOT gate only uses switch A
      default:
        return false;
    }
  };

  const checkCompletion = async () => {
    if (gameState.bulbLit && gameState.selectedGate && !gameState.isCompleted) {
      const newXp = 30;
      setGameState(prev => ({ ...prev, xp: newXp, isCompleted: true }));
      
      if (user) {
        try {
          // Update module completion
          await supabase.from('module_completion').upsert({
            user_id: user.id,
            module_id: `logic_gate_${6}`,
            completion_status: 'completed',
            xp_earned: newXp,
          });

          // Update user progress
          await updateProgress(newXp, 0);
          
          // Add badge
          await addBadge('Logic Tinkerer', 'Technology');
          
          toast.success(language === 'odia' ? 'ବଧାଇ! ସର୍କିଟ ସଠିକ କାମ କରୁଛି!' : 'Congratulations! The circuit works correctly!');
          setShowModal(true);
        } catch (error) {
          console.error('Error updating progress:', error);
          toast.error(language === 'odia' ? 'ପ୍ରଗତି ସେଭ କରିବାରେ ସମସ୍ୟା' : 'Error saving progress');
        }
      }
    }
  };

  const handleSwitchToggle = (switchName: 'A' | 'B') => {
    setGameState(prev => {
      const newState = {
        ...prev,
        [switchName === 'A' ? 'switchA' : 'switchB']: !prev[switchName === 'A' ? 'switchA' : 'switchB'],
      };
      
      const bulbLit = checkLogic(prev.selectedGate, newState.switchA, newState.switchB);
      const updatedState = { ...newState, bulbLit };
      
      if (bulbLit && prev.selectedGate) {
        setTimeout(() => checkCompletion(), 500);
      }
      
      return updatedState;
    });
  };

  const handleGateSelect = (gateType: 'AND' | 'OR' | 'NOT') => {
    setGameState(prev => {
      const bulbLit = checkLogic(gateType, prev.switchA, prev.switchB);
      const newState = { ...prev, selectedGate: gateType, bulbLit };
      
      if (bulbLit) {
        setTimeout(() => checkCompletion(), 500);
      }
      
      return newState;
    });
  };

  const reset = () => {
    setGameState(initialState);
    setShowModal(false);
  };

  const getInstructions = () => {
    if (language === 'odia') {
      return [
        '୧. ଗେଟ୍ ପ୍ୟାଲେଟରୁ ଏକ ଲଜିକ୍ ଗେଟ୍ ସିଲେକ୍ଟ କରନ୍ତୁ',
        '୨. ସ୍ୱିଚ୍ A ଏବଂ B କ୍ଲିକ୍ କରି ସେଗୁଡ଼ିକୁ ଅନ୍/ଅଫ୍ କରନ୍ତୁ',
        '୩. ବଲବ୍ ଜଳୁଛି କି ନାହିଁ ଦେଖନ୍ତୁ',
        '୪. ସଠିକ୍ କମ୍ବିନେସନ୍ ପାଇଲେ ଆପଣ ଜିତିବେ!',
      ];
    }
    
    return [
      '1. Select a logic gate from the palette',
      '2. Click switches A and B to turn them on/off',
      '3. Watch if the bulb lights up',
      '4. Find the right combination to win!',
    ];
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <GameHeader
          title={language === 'odia' ? 'ଲଜିକ୍ ଗେଟ୍ ସିମୁଲେଟର' : 'Logic Gate Simulator'}
          xp={gameState.xp}
          onBack={onBack}
          language={language}
          subject="Technology"
        />

        <div className="container mx-auto p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Logic Gates Palette */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'odia' ? 'ଲଜିକ୍ ଗେଟ୍ସ' : 'Logic Gates'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LogicGatesPalette
                    language={language}
                    selectedGate={gameState.selectedGate}
                    onGateSelect={handleGateSelect}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Circuit Board */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'odia' ? 'ସର୍କିଟ ବୋର୍ଡ' : 'Circuit Board'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <LogicBoard
                    language={language}
                    switchA={gameState.switchA}
                    switchB={gameState.switchB}
                    selectedGate={gameState.selectedGate}
                    bulbLit={gameState.bulbLit}
                    onSwitchToggle={handleSwitchToggle}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Instructions and Progress */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'odia' ? 'ନିର୍ଦ୍ଦେଶାବଳୀ' : 'Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {getInstructions().map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{language === 'odia' ? 'ସମ୍ପୂର୍ଣ୍ଣତା' : 'Completion'}</span>
                      <span>{getCompletion()}%</span>
                    </div>
                    <Progress value={getCompletion()} className="h-2" />
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {language === 'odia' ? 'ବର୍ତ୍ତମାନ ଅବସ୍ଥା' : 'Current Status'}
                    </div>
                    <div className="font-medium">
                      {gameState.selectedGate 
                        ? (gameState.bulbLit 
                          ? (language === 'odia' ? '✅ ବଲବ୍ ଜଳୁଛି!' : '✅ Bulb is ON!')
                          : (language === 'odia' ? '❌ ବଲବ୍ ବନ୍ଦ' : '❌ Bulb is OFF'))
                        : (language === 'odia' ? '⚪ ଗେଟ୍ ସିଲେକ୍ଟ କରନ୍ତୁ' : '⚪ Select a gate')
                      }
                    </div>
                  </div>

                  {gameState.isCompleted && (
                    <Button onClick={reset} className="w-full">
                      {language === 'odia' ? 'ପୁଣି ଖେଳନ୍ତୁ' : 'Play Again'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <CompletionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onPlayAgain={reset}
          onReturnHome={onBack}
          xpEarned={gameState.xp}
          badgeName="Logic Tinkerer"
          language={language}
          gameName={language === 'odia' ? 'ଲଜିକ୍ ଗେଟ୍ ସିମୁଲେଟର' : 'Logic Gate Simulator'}
        />
      </div>
    </DndProvider>
  );
};