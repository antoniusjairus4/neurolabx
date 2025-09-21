import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogicBoard } from './components/LogicBoard';
import { LogicGatesPalette } from './components/LogicGatesPalette';
import { Zap, RotateCcw } from 'lucide-react';

interface GameState {
  switchA: boolean;
  switchB: boolean;
  selectedGate: 'AND' | 'OR' | 'NOT' | null;
  connections: string[];
  bulbLit: boolean;
  totalXP: number;
  completed: boolean;
}

const initialState: GameState = {
  switchA: false,
  switchB: false,
  selectedGate: null,
  connections: [],
  bulbLit: false,
  totalXP: 0,
  completed: false,
};

export const LogicGateGame: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, fetchUserData } = useUserStore();
  const [state, setState] = useState<GameState>(initialState);
  const [showCompletion, setShowCompletion] = useState(false);

  const getCompletion = () => {
    let completion = 0;
    if (state.selectedGate) completion += 40;
    if (state.switchA || state.switchB) completion += 30;
    if (state.bulbLit) completion += 30;
    return completion;
  };

  const checkLogic = useCallback((switchA: boolean, switchB: boolean, gate: 'AND' | 'OR' | 'NOT' | null): boolean => {
    if (!gate) return false;
    
    switch (gate) {
      case 'AND':
        return switchA && switchB;
      case 'OR':
        return switchA || switchB;
      case 'NOT':
        return !switchA; // NOT gate only uses first switch
      default:
        return false;
    }
  }, []);

  const checkCompletion = async (newState: GameState, xpEarned: number) => {
    if (newState.bulbLit && !newState.completed && user) {
      const finalState = { ...newState, completed: true, totalXP: newState.totalXP + xpEarned };
      setState(finalState);

      try {
        // Check if completion already exists
        const { data: existingCompletion } = await supabase
          .from('module_completion')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', 'logic_gate_6')
          .maybeSingle();

        if (existingCompletion) {
          // Update existing completion
          await supabase
            .from('module_completion')
            .update({
              attempts: existingCompletion.attempts + 1,
              best_score: Math.max(existingCompletion.best_score || 0, 100),
              xp_earned: Math.max(existingCompletion.xp_earned, xpEarned),
              completion_status: 'completed',
            })
            .eq('id', existingCompletion.id);
        } else {
          // Create new completion
          await supabase
            .from('module_completion')
            .insert({
              user_id: user.id,
              module_id: 'logic_gate_6',
              attempts: 1,
              best_score: 100,
              xp_earned: xpEarned,
              completion_status: 'completed',
            });
        }

        // Update user progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();

        if (progressData) {
          await supabase
            .from('user_progress')
            .update({ total_xp: progressData.total_xp + xpEarned })
            .eq('user_id', user.id);
        }

        // Add badge if not already earned
        const { data: existingBadge } = await supabase
          .from('badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('badge_name', 'Logic Tinkerer')
          .maybeSingle();

        if (!existingBadge) {
          await supabase
            .from('badges')
            .insert({
              user_id: user.id,
              badge_name: 'Logic Tinkerer',
              module_name: 'logic_gate_6',
            });
        }

        // Refresh user data to update dashboard
        await fetchUserData(user.id);

        setShowCompletion(true);
      } catch (error) {
        console.error('Error updating completion:', error);
        toast.error('Failed to save progress');
      }
    }
  };

  const handleSwitchToggle = (switchName: 'A' | 'B') => {
    const newState = {
      ...state,
      [switchName === 'A' ? 'switchA' : 'switchB']: !state[switchName === 'A' ? 'switchA' : 'switchB'],
    };
    
    // Check if bulb should be lit based on current logic
    const bulbLit = checkLogic(newState.switchA, newState.switchB, newState.selectedGate);
    newState.bulbLit = bulbLit;

    setState(newState);

    if (bulbLit) {
      checkCompletion(newState, 30);
    }
  };

  const handleGateSelect = (gate: 'AND' | 'OR' | 'NOT') => {
    const newState = { ...state, selectedGate: gate, totalXP: state.totalXP + 10 };
    
    // Check if bulb should be lit based on new gate
    const bulbLit = checkLogic(newState.switchA, newState.switchB, gate);
    newState.bulbLit = bulbLit;

    setState(newState);

    if (bulbLit) {
      checkCompletion(newState, 30);
    }
  };

  const reset = () => {
    setState(initialState);
    setShowCompletion(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4">
        <div className="container mx-auto max-w-7xl">
          <GameHeader
            title={language === 'odia' ? 'ଲଜିକ ଗେଟ ସିମୁଲେଟର' : 'Logic Gate Simulator'}
            xp={state.totalXP}
            onBack={() => navigate(-1)}
            language={language}
          />

          <div className="grid lg:grid-cols-4 gap-6 mt-6">
            {/* Gates Palette */}
            <div className="lg:col-span-1">
              <LogicGatesPalette
                language={language}
                selectedGate={state.selectedGate}
                onGateSelect={handleGateSelect}
              />
            </div>

            {/* Main Game Board */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-technology">
                      {language === 'odia' ? 'ସର୍କିଟ ବୋର୍ଡ' : 'Circuit Board'}
                    </span>
                    <Progress value={getCompletion()} className="w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <LogicBoard
                    language={language}
                    switchA={state.switchA}
                    switchB={state.switchB}
                    selectedGate={state.selectedGate}
                    bulbLit={state.bulbLit}
                    onSwitchToggle={handleSwitchToggle}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Instructions Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-technology text-lg">
                    {language === 'odia' ? 'ନିର୍ଦ୍ଦେଶାବଳୀ' : 'Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-technology font-semibold">1.</span>
                    <span>
                      {language === 'odia' 
                        ? 'ଗୋଟିଏ ଲଜିକ ଗେଟ ବାଛନ୍ତୁ (AND, OR, କିମ୍ବା NOT)'
                        : 'Select a logic gate (AND, OR, or NOT)'
                      }
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-technology font-semibold">2.</span>
                    <span>
                      {language === 'odia' 
                        ? 'ସୁଇଚ A ଏବଂ B କ୍ଲିକ କରନ୍ତୁ'
                        : 'Click switches A and B to toggle them'
                      }
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-technology font-semibold">3.</span>
                    <span>
                      {language === 'odia' 
                        ? 'ବଲ୍ବ ଜଳାଇବା ପାଇଁ ସଠିକ କମ୍ବିନେସନ ଖୋଜନ୍ତୁ'
                        : 'Find the right combination to light the bulb'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-technology text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {language === 'odia' ? 'ସଂପୂର୍ଣ୍ଣତା' : 'Completion'}
                    </span>
                    <span className="font-semibold text-technology">{getCompletion()}%</span>
                  </div>
                  <Progress value={getCompletion()} />
                  <div className="text-xs text-muted-foreground text-center">
                    XP: {state.totalXP}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={reset}
                variant="outline"
                className="w-full gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {language === 'odia' ? 'ପୁଣି ଖେଳ' : 'Play Again'}
              </Button>
            </div>
          </div>
        </div>

        <CompletionModal
          isOpen={showCompletion}
          onClose={() => setShowCompletion(false)}
          onPlayAgain={reset}
          onReturnHome={() => navigate('/')}
          xpEarned={30}
          badgeName="Logic Tinkerer"
          language={language}
          gameName={language === 'odia' ? 'ଲଜିକ ଗେଟ ସିମୁଲେଟର' : 'Logic Gate Simulator'}
        />
      </div>
    </DndProvider>
  );
};