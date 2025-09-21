import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { DraggableElement } from './components/DraggableElement';
import { DropZone } from './components/DropZone';
import { PlantVisualization } from './components/PlantVisualization';
import { GameHeader } from './components/GameHeader';
import { CompletionModal } from './components/CompletionModal';
import { ScientificFactPopup } from './components/ScientificFactPopup';
import { Droplets, Sun, Cloud, Trophy, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameElement {
  id: string;
  type: 'water' | 'sunlight' | 'co2';
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string;
  targetOdia: string;
  xpReward: number;
  feedback: string;
  feedbackOdia: string;
  used: boolean;
}

interface GameState {
  waterAdded: boolean;
  sunlightAdded: boolean;
  co2Added: boolean;
  totalXp: number;
  completed: boolean;
}

export const PhotosynthesisGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>({
    waterAdded: false,
    sunlightAdded: false,
    co2Added: false,
    totalXp: 0,
    completed: false,
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [plantGrowthStage, setPlantGrowthStage] = useState(0);
  const [currentFact, setCurrentFact] = useState<{
    title: string;
    titleOdia: string;
    description: string;
    descriptionOdia: string;
    type: 'water' | 'sunlight' | 'co2';
  } | null>(null);
  const [showFactPopup, setShowFactPopup] = useState(false);

  // Scientific facts for each action
  const scientificFacts = {
    water: {
      title: "Water Transport in Plants",
      titleOdia: "ଉଦ୍ଭିଦରେ ଜଳ ପରିବହନ",
      description: "Plants absorb water through their roots from the soil. This water travels up through the stem to reach all parts of the plant, carrying nutrients and minerals.",
      descriptionOdia: "ଉଦ୍ଭିଦ ମାଟିରୁ ମୂଳ ଦ୍ୱାରା ଜଳ ଶୋଷଣ କରେ। ଏହି ଜଳ କାଣ୍ଡ ଦେଇ ଉପରକୁ ଯାଇ ଉଦ୍ଭିଦର ସମସ୍ତ ଅଂଶରେ ପହଞ୍ଚେ ଏବଂ ପୋଷକ ତତ୍ତ୍ୱ ଓ ଖଣିଜ ବସ୍ତୁ ବହନ କରେ।",
      type: 'water' as const,
    },
    sunlight: {
      title: "Chlorophyll and Light Energy",
      titleOdia: "କ୍ଲୋରୋଫିଲ୍ ଓ ଆଲୋକ ଶକ୍ତି",
      description: "Chlorophyll in plant leaves captures sunlight energy. This green pigment is essential for converting light energy into chemical energy during photosynthesis.",
      descriptionOdia: "ଉଦ୍ଭିଦ ପତ୍ରରେ ଥିବା କ୍ଲୋରୋଫିଲ୍ ସୂର୍ଯ୍ୟାଲୋକ ଶକ୍ତି ଗ୍ରହଣ କରେ। ଏହି ସବୁଜ ରଙ୍ଗର ପଦାର୍ଥ ଫୋଟୋସିନ୍ଥେସିସ୍ ସମୟରେ ଆଲୋକ ଶକ୍ତିକୁ ରାସାୟନିକ ଶକ୍ତିରେ ପରିଣତ କରିବା ପାଇଁ ଅତ୍ୟାବଶ୍ୟକ।",
      type: 'sunlight' as const,
    },
    co2: {
      title: "Carbon Dioxide and Glucose Production",
      titleOdia: "କାର୍ବନ ଡାଇଅକ୍ସାଇଡ୍ ଓ ଗ୍ଲୁକୋଜ୍ ଉତ୍ପାଦନ",
      description: "Plants take in carbon dioxide from the air through tiny pores called stomata. During photosynthesis, CO₂ combines with water to produce glucose and oxygen.",
      descriptionOdia: "ଉଦ୍ଭିଦ ବାୟୁମଣ୍ଡଳରୁ ଷ୍ଟୋମାଟା ନାମକ ଛୋଟ ଛିଦ୍ର ଦ୍ୱାରା କାର୍ବନ ଡାଇଅକ୍ସାଇଡ୍ ଗ୍ରହଣ କରେ। ଫୋଟୋସିନ୍ଥେସିସ୍ ସମୟରେ CO₂ ଜଳ ସହିତ ମିଶି ଗ୍ଲୁକୋଜ୍ ଓ ଅମ୍ଳଜାନ ଉତ୍ପାଦନ କରେ।",
      type: 'co2' as const,
    },
  };

  const gameElements: GameElement[] = [
    {
      id: 'water',
      type: 'water',
      name: 'Water Droplet',
      nameOdia: 'ପାଣି ବିନ୍ଦୁ',
      icon: Droplets,
      target: 'Plant Roots',
      targetOdia: 'ଉଦ୍ଭିଦ ମୂଳ',
      xpReward: 10,
      feedback: 'Water added to roots. Plant is thriving!',
      feedbackOdia: 'ମୂଳରେ ପାଣି ଯୋଗ କରାଗଲା। ଉଦ୍ଭିଦ ବୃଦ୍ଧି ପାଉଛି!',
      used: gameState.waterAdded,
    },
    {
      id: 'sunlight',
      type: 'sunlight',
      name: 'Sunlight',
      nameOdia: 'ସୂର୍ଯ୍ୟାଲୋକ',
      icon: Sun,
      target: 'Plant Leaves',
      targetOdia: 'ଉଦ୍ଭିଦ ପତ୍ର',
      xpReward: 10,
      feedback: 'Sunlight absorbed. Leaves are expanding!',
      feedbackOdia: 'ସୂର୍ଯ୍ୟାଲୋକ ଅବଶୋଷିତ। ପତ୍ର ବିସ୍ତାର ହେଉଛି!',
      used: gameState.sunlightAdded,
    },
    {
      id: 'co2',
      type: 'co2',
      name: 'CO₂ Bubble',
      nameOdia: 'CO₂ ବୁବୁଲା',
      icon: Cloud,
      target: 'Air Near Plant',
      targetOdia: 'ଉଦ୍ଭିଦ ନିକଟ ବାୟୁ',
      xpReward: 10,
      feedback: 'CO₂ supplied. Photosynthesis in progress!',
      feedbackOdia: 'CO₂ ଯୋଗାଣ କରାଗଲା। ଫୋଟୋସିନ୍ଥେସିସ୍ ଚାଲୁଛି!',
      used: gameState.co2Added,
    },
  ];

  const handleElementDrop = async (elementType: 'water' | 'sunlight' | 'co2') => {
    const element = gameElements.find(el => el.type === elementType);
    if (!element || element.used) return;

    const newState = { ...gameState };
    let newXp = element.xpReward;

    switch (elementType) {
      case 'water':
        if (!newState.waterAdded) {
          newState.waterAdded = true;
          setPlantGrowthStage(1);
          setCurrentFact(scientificFacts.water);
          setShowFactPopup(true);
        }
        break;
      case 'sunlight':
        if (!newState.sunlightAdded) {
          newState.sunlightAdded = true;
          setPlantGrowthStage(2);
          setCurrentFact(scientificFacts.sunlight);
          setShowFactPopup(true);
        }
        break;
      case 'co2':
        if (!newState.co2Added) {
          newState.co2Added = true;
          setPlantGrowthStage(3);
          setCurrentFact(scientificFacts.co2);
          setShowFactPopup(true);
        }
        break;
    }

    newState.totalXp += newXp;
    
    console.log('Game state before completion check:', { ...newState }); // Debug log
    
    // Check if game is completed
    if (newState.waterAdded && newState.sunlightAdded && newState.co2Added && !newState.completed) {
      newState.completed = true;
      newXp += 50; // Completion bonus
      newState.totalXp += 50;
      console.log('Game completed! Total XP:', newState.totalXp); // Debug log
    }

    setGameState(newState);

    // Show success toast
    toast({
      title: language === 'odia' ? 'ସଫଳ!' : 'Success!',
      description: language === 'odia' ? element.feedbackOdia : element.feedback,
    });

    // Update progress in database
    if (user) {
      await updateProgress(newXp, 0);
      
      // Update module completion - IMPORTANT: Use newState.totalXp not just newXp
      try {
        const { data: existingCompletion } = await supabase
          .from('module_completion')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', 'photosynthesis_6')
          .single();

        const completionData = {
          completion_status: newState.completed ? 'completed' : 'in_progress',
          xp_earned: newState.totalXp, // Use total XP from game state
          attempts: (existingCompletion?.attempts || 0) + 1,
          best_score: Math.max(existingCompletion?.best_score || 0, newState.totalXp),
        };

        if (existingCompletion) {
          await supabase
            .from('module_completion')
            .update(completionData)
            .eq('user_id', user.id)
            .eq('module_id', 'photosynthesis_6');
        } else {
          await supabase
            .from('module_completion')
            .insert({
              user_id: user.id,
              module_id: 'photosynthesis_6',
              ...completionData,
            });
        }

        console.log('Module completion updated:', completionData); // Debug log
      } catch (error) {
        console.error('Error updating module completion:', error);
      }

      // Award badge if completed
      if (newState.completed) {
        await addBadge('Photosynthesis Master', 'Class 6 Science');
        // Delay showing completion modal until after fact popup is closed
        setTimeout(() => {
          if (!showFactPopup) {
            setShowCompletion(true);
          }
        }, 2000);
      }
    }
  };

  const getCompletionPercentage = () => {
    const completedActions = [gameState.waterAdded, gameState.sunlightAdded, gameState.co2Added].filter(Boolean).length;
    return (completedActions / 3) * 100;
  };

  const resetGame = () => {
    setGameState({
      waterAdded: false,
      sunlightAdded: false,
      co2Added: false,
      totalXp: 0,
      completed: false,
    });
    setPlantGrowthStage(0);
    setShowCompletion(false);
    setShowFactPopup(false);
    setCurrentFact(null);
  };

  const handleFactClose = () => {
    setShowFactPopup(false);
    // If game is completed and fact popup is closing, show completion modal
    if (gameState.completed) {
      setTimeout(() => setShowCompletion(true), 500);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-science/5 via-background to-technology/5">
        <GameHeader 
          title={language === 'odia' ? 'ଫୋଟୋସିନ୍ଥେସିସ୍ ଖେଳ' : 'Photosynthesis Simulation'}
          xp={gameState.totalXp}
          onBack={() => navigate('/')}
          language={language}
        />

        <main className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Game Elements Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-science">
                  <Trophy className="h-5 w-5" />
                  {language === 'odia' ? 'ଉପାଦାନ' : 'Elements'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameElements.map((element) => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    language={language}
                    disabled={element.used}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Game World */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}
                    </CardTitle>
                    <Badge variant="secondary">
                      {Math.round(getCompletionPercentage())}%
                    </Badge>
                  </div>
                  <Progress value={getCompletionPercentage()} className="h-2" />
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-b from-sky-50 to-green-50 dark:from-sky-950/20 dark:to-green-950/20 border-science/20">
                <CardContent className="p-8">
                  <div className="relative h-96 flex items-center justify-center">
                    <PlantVisualization 
                      growthStage={plantGrowthStage}
                      waterAdded={gameState.waterAdded}
                      sunlightAdded={gameState.sunlightAdded}
                      co2Added={gameState.co2Added}
                    />
                    
                    {/* Drop zones */}
                    <DropZone
                      type="water"
                      position="bottom-left"
                      onDrop={() => handleElementDrop('water')}
                      active={!gameState.waterAdded}
                      label={language === 'odia' ? 'ମୂଳ' : 'Roots'}
                    />
                    
                    <DropZone
                      type="sunlight"
                      position="top-center"
                      onDrop={() => handleElementDrop('sunlight')}
                      active={!gameState.sunlightAdded}
                      label={language === 'odia' ? 'ପତ୍ର' : 'Leaves'}
                    />
                    
                    <DropZone
                      type="co2"
                      position="middle-right"
                      onDrop={() => handleElementDrop('co2')}
                      active={!gameState.co2Added}
                      label={language === 'odia' ? 'ବାୟୁ' : 'Air'}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  {language === 'odia' ? 'ନିର୍ଦ୍ଦେଶନା' : 'Instructions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${gameState.waterAdded ? 'bg-science/10 text-science' : 'bg-muted'}`}>
                    <p className="text-sm font-medium">
                      {language === 'odia' ? '1. ପାଣି ମୂଳରେ ଦିଅ' : '1. Add water to roots'}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${gameState.sunlightAdded ? 'bg-science/10 text-science' : 'bg-muted'}`}>
                    <p className="text-sm font-medium">
                      {language === 'odia' ? '2. ସୂର୍ଯ୍ୟାଲୋକ ପତ୍ରରେ ଦିଅ' : '2. Add sunlight to leaves'}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${gameState.co2Added ? 'bg-science/10 text-science' : 'bg-muted'}`}>
                    <p className="text-sm font-medium">
                      {language === 'odia' ? '3. CO₂ ବାୟୁରେ ଦିଅ' : '3. Add CO₂ to air'}
                    </p>
                  </div>
                </div>

                {gameState.completed && (
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="w-full"
                  >
                    {language === 'odia' ? 'ପୁଣି ଖେଳ' : 'Play Again'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <AnimatePresence>
          {showCompletion && gameState.completed && (
            <CompletionModal
              isOpen={showCompletion}
              onClose={() => setShowCompletion(false)}
              onPlayAgain={resetGame}
              onReturnHome={() => navigate('/')}
              xpEarned={gameState.totalXp}
              badgeName="Photosynthesis Master"
              language={language}
            />
          )}
        </AnimatePresence>

        {/* Scientific Fact Popup */}
        {currentFact && (
          <ScientificFactPopup
            isOpen={showFactPopup}
            onClose={handleFactClose}
            fact={currentFact}
            language={language}
          />
        )}
      </div>
    </DndProvider>
  );
};