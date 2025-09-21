import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { DraggablePiece } from './components/DraggablePiece';
import { CircuitDropZone } from './components/CircuitDropZone';
import { CircuitBoard } from './components/CircuitBoard';
import { GameHeader } from '@/components/games/components/GameHeader';
import { CompletionModal } from '@/components/games/components/CompletionModal';
import { Battery, ToggleLeft, Lightbulb, Cable, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameState {
  battery: boolean;
  switch: boolean;
  bulb: boolean;
  wires: boolean;
  totalXp: number;
  completed: boolean;
}

export const CircuitBuilderGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, setState] = useState<GameState>({ battery: false, switch: false, bulb: false, wires: false, totalXp: 0, completed: false });
  const [showCompletion, setShowCompletion] = useState(false);

  const pieces = [
    { id: 'battery', type: 'battery' as const, name: 'Battery', nameOdia: 'ବ୍ୟାଟେରୀ', icon: Battery, used: state.battery },
    { id: 'switch', type: 'switch' as const, name: 'Switch', nameOdia: 'ସ୍ୱିଚ୍', icon: ToggleLeft, used: state.switch },
    { id: 'bulb', type: 'bulb' as const, name: 'Bulb', nameOdia: 'ବଲ୍ବ', icon: Lightbulb, used: state.bulb },
    { id: 'wires', type: 'wires' as const, name: 'Wires', nameOdia: 'ତାର', icon: Cable, used: state.wires },
  ];

  const getCompletion = () => (['battery','switch','bulb','wires'].filter(k => (state as any)[k]).length / 4) * 100;

  const checkCompletion = async (newState: GameState, xpEarned: number) => {
    if (newState.battery && newState.switch && newState.bulb && newState.wires && !newState.completed) {
      newState.completed = true;
      newState.totalXp += 50; // completion bonus
      xpEarned += 50;

      if (user) {
        await updateProgress(50, 0); // Award completion bonus
        try {
          const { data: existing } = await supabase.from('module_completion').select('*').eq('user_id', user.id).eq('module_id', 'circuit_builder_6').single();
          
          const completionData = {
            completion_status: 'completed',
            xp_earned: newState.totalXp,
            attempts: (existing?.attempts || 0) + 1,
            best_score: Math.max(existing?.best_score || 0, newState.totalXp),
          };

          if (existing) {
            await supabase.from('module_completion').update(completionData).eq('user_id', user.id).eq('module_id', 'circuit_builder_6');
          } else {
            await supabase.from('module_completion').insert({ user_id: user.id, module_id: 'circuit_builder_6', ...completionData });
          }

          console.log('Circuit builder completed:', completionData); // Debug log
        } catch (e) { console.error(e); }

        await addBadge('Circuit Master', 'Class 6 Engineering');
      }

      setShowCompletion(true);
      toast({ title: language === 'odia' ? 'ବିଦ୍ୟୁତ୍ ସର୍କିଟ୍ ସମ୍ପୂର୍ଣ୍ଣ!' : 'Circuit completed!', description: language === 'odia' ? 'ବିଦ୍ୟୁତ୍ ପ୍ରବାହିତ ହେଉଛି!' : 'Electricity flows!' });
    }
  };

  const handleDrop = async (type: 'battery' | 'switch' | 'bulb' | 'wires') => {
    if (state.completed) return;

    let updated: GameState | null = null;

    // Functional update to prevent stale state issues when placing quickly
    setState(prev => {
      if ((prev as any)[type]) return prev; // already placed
      const ns = { ...prev, [type]: true } as GameState;
      ns.totalXp += 10;
      updated = ns;
      return ns;
    });

    if (!updated) return; // nothing changed

    toast({ title: language === 'odia' ? 'ସଠିକ୍!' : 'Correct!', description: language === 'odia' ? 'ଉପାଦାନ ଭଲଭାବେ ସ୍ଥାପିତ ହେଲା' : 'Component placed correctly.' });

    if (user) {
      await updateProgress(10, 0);
      try {
        const { data: existing } = await supabase.from('module_completion').select('*').eq('user_id', user.id).eq('module_id', 'circuit_builder_6').single();
        if (existing) {
          await supabase.from('module_completion').update({ completion_status: 'in_progress', xp_earned: updated.totalXp, attempts: (existing.attempts || 0) + 1 }).eq('user_id', user.id).eq('module_id', 'circuit_builder_6');
        } else {
          await supabase.from('module_completion').insert({ user_id: user.id, module_id: 'circuit_builder_6', completion_status: 'in_progress', xp_earned: updated.totalXp, attempts: 1, best_score: updated.totalXp });
        }
      } catch (e) { console.error(e); }
    }

    await checkCompletion(updated, 10);
  };

  const reset = () => {
    setState({ battery: false, switch: false, bulb: false, wires: false, totalXp: 0, completed: false });
    setShowCompletion(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-engineering/5 via-background to-technology/5">
        <GameHeader title={language === 'odia' ? 'ସର୍କିଟ୍ ବିଲ୍ଡର' : 'Circuit Builder'} xp={state.totalXp} onBack={() => navigate('/')} language={language} />

        <main className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Components panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-engineering">
                  <Trophy className="h-5 w-5" />
                  {language === 'odia' ? 'ଉପାଦାନ' : 'Components'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pieces.map(piece => (
                  <DraggablePiece key={piece.id} piece={piece} language={language} disabled={piece.used || state.completed} />
                ))}
              </CardContent>
            </Card>

            {/* Board and progress */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}</CardTitle>
                    <Badge variant="secondary">{Math.round(getCompletion())}%</Badge>
                  </div>
                  <Progress value={getCompletion()} className="h-2" />
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-b from-muted/30 to-muted/50 border-engineering/20 relative">
                <CardContent className="p-8">
                  <div className="relative h-96">
                    <CircuitBoard batteryPlaced={state.battery} switchPlaced={state.switch} bulbPlaced={state.bulb} wiresPlaced={state.wires} completed={state.completed} />

                    {/* Drop Zones positioned around path */}
                    <CircuitDropZone type="battery" label={language === 'odia' ? 'ବ୍ୟାଟେରୀ' : 'Battery'} active={!state.battery && !state.completed} onDrop={() => handleDrop('battery')} style={{ left: 40, bottom: 40, width: 80, height: 40 }} />
                    <CircuitDropZone type="switch" label={language === 'odia' ? 'ସ୍ୱିଚ୍' : 'Switch'} active={!state.switch && !state.completed} onDrop={() => handleDrop('switch')} style={{ right: 40, bottom: 40, width: 80, height: 40 }} />
                    <CircuitDropZone type="bulb" label={language === 'odia' ? 'ବଲ୍ବ' : 'Bulb'} active={!state.bulb && !state.completed} onDrop={() => handleDrop('bulb')} style={{ left: '50%', top: 40, width: 80, height: 40, transform: 'translateX(-50%)' }} />
                    <CircuitDropZone type="wires" label={language === 'odia' ? 'ତାର' : 'Wires'} active={!state.wires && !state.completed} onDrop={() => handleDrop('wires')} style={{ left: '50%', bottom: 140, width: 100, height: 40, transform: 'translateX(-50%)' }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{language === 'odia' ? 'ନିର୍ଦ୍ଦେଶନା' : 'Instructions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['battery','switch','bulb','wires'].map((k, i) => (
                  <div key={k} className={`p-3 rounded-lg ${ (state as any)[k] ? 'bg-engineering/10 text-engineering' : 'bg-muted' }`}>
                    <p className="text-sm font-medium">
                      {language === 'odia' ? `${i+1}. ଠିକ୍ ସ୍ଥାନରେ ${k}` : `${i+1}. Place ${k} correctly`}
                    </p>
                  </div>
                ))}
                {state.completed && (
                  <Button onClick={reset} variant="outline" className="w-full">
                    {language === 'odia' ? 'ପୁଣି ଖେଳ' : 'Play Again'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {showCompletion && (
          <CompletionModal isOpen={showCompletion} onClose={() => setShowCompletion(false)} onPlayAgain={reset} onReturnHome={() => navigate('/')} xpEarned={state.totalXp} badgeName="Circuit Master" language={language} />
        )}
      </div>
    </DndProvider>
  );
};