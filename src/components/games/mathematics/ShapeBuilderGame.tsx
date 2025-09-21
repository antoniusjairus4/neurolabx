import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { MathDraggableElement } from './components/MathDraggableElement';
import { MathDropZone } from './components/MathDropZone';
import { Triangle, Square, RectangleHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Shape {
  id: string;
  type: 'triangle' | 'rectangle' | 'square';
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  used: boolean;
  dimensions?: { length?: number; width?: number; side?: number; base?: number; height?: number };
}

interface ShapeState {
  trianglePlaced: boolean;
  rectanglePlaced: boolean;
  squarePlaced: boolean;
  areaCalculated: boolean;
  perimeterCalculated: boolean;
  totalXp: number;
  completed: boolean;
}

export const ShapeBuilderGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge } = useUserStore();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<ShapeState>({
    trianglePlaced: false,
    rectanglePlaced: false,
    squarePlaced: false,
    areaCalculated: false,
    perimeterCalculated: false,
    totalXp: 0,
    completed: false
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  const [calculationStep, setCalculationStep] = useState('area');

  const shapes: Shape[] = [
    {
      id: 'triangle',
      type: 'triangle',
      name: 'Triangle',
      nameOdia: 'ତ୍ରିଭୁଜ',
      icon: Triangle,
      used: gameState.trianglePlaced,
      dimensions: { base: 6, height: 4 }
    },
    {
      id: 'rectangle',
      type: 'rectangle',
      name: 'Rectangle',
      nameOdia: 'ଆୟତ',
      icon: RectangleHorizontal,
      used: gameState.rectanglePlaced,
      dimensions: { length: 8, width: 5 }
    },
    {
      id: 'square',
      type: 'square',
      name: 'Square',
      nameOdia: 'ବର୍ଗ',
      icon: Square,
      used: gameState.squarePlaced,
      dimensions: { side: 6 }
    }
  ];

  const handleShapeDrop = (shapeType: string) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        [`${shapeType}Placed`]: true,
        totalXp: prev.totalXp + 10
      };
      return newState;
    });

    toast({
      title: language === 'odia' ? 'ଆକୃତି ସ୍ଥାପିତ!' : 'Shape Placed!',
      description: language === 'odia' 
        ? 'ଗଣନା ପାଇଁ ପ୍ରସ୍ତୁତ' 
        : 'Ready for calculation',
    });
  };

  const handleCalculation = (type: 'area' | 'perimeter') => {
    setGameState(prev => ({
      ...prev,
      [type === 'area' ? 'areaCalculated' : 'perimeterCalculated']: true,
      totalXp: prev.totalXp + 10
    }));

    toast({
      title: language === 'odia' ? 'ସଠିକ୍!' : 'Correct!',
      description: language === 'odia' 
        ? `${type === 'area' ? 'କ୍ଷେତ୍ରଫଳ' : 'ପରିସୀମା'} ଗଣନା ସଠିକ୍` 
        : `${type === 'area' ? 'Area' : 'Perimeter'} calculated correctly`,
    });
  };

  useEffect(() => {
    const shapesPlaced = gameState.trianglePlaced && gameState.rectanglePlaced && gameState.squarePlaced;
    const calculationsComplete = gameState.areaCalculated && gameState.perimeterCalculated;
    
    let progress = 0;
    if (gameState.trianglePlaced) progress += 20;
    if (gameState.rectanglePlaced) progress += 20;
    if (gameState.squarePlaced) progress += 20;
    if (gameState.areaCalculated) progress += 20;
    if (gameState.perimeterCalculated) progress += 20;
    
    setCurrentProgress(progress);

    if (shapesPlaced && !showCalculation) {
      setShowCalculation(true);
    }

    if (shapesPlaced && calculationsComplete && !gameState.completed) {
      setGameState(prev => ({ ...prev, completed: true }));
      handleGameCompletion();
    }
  }, [gameState.trianglePlaced, gameState.rectanglePlaced, gameState.squarePlaced, gameState.areaCalculated, gameState.perimeterCalculated]);

  const handleGameCompletion = async () => {
    if (!user) return;

    try {
      // Update module completion
      await supabase.from('module_completion').upsert({
        user_id: user.id,
        module_id: 'shape_builder_6',
        completion_status: 'completed',
        xp_earned: gameState.totalXp + 20,
        best_score: 100
      });

      // Update user progress
      await updateProgress(gameState.totalXp + 20, 0);
      
      // Add badge
      await addBadge('Shape Genius', 'shape_builder_6');

      setShowCompletion(true);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getAreaFormula = (shape: Shape) => {
    switch (shape.type) {
      case 'triangle':
        return `½ × ${shape.dimensions?.base} × ${shape.dimensions?.height} = ${(shape.dimensions?.base || 0) * (shape.dimensions?.height || 0) / 2}`;
      case 'rectangle':
        return `${shape.dimensions?.length} × ${shape.dimensions?.width} = ${(shape.dimensions?.length || 0) * (shape.dimensions?.width || 0)}`;
      case 'square':
        return `${shape.dimensions?.side} × ${shape.dimensions?.side} = ${(shape.dimensions?.side || 0) ** 2}`;
      default:
        return '';
    }
  };

  const getPerimeterFormula = (shape: Shape) => {
    switch (shape.type) {
      case 'triangle':
        return `${shape.dimensions?.base} + ${shape.dimensions?.height} + 5 = ${(shape.dimensions?.base || 0) + (shape.dimensions?.height || 0) + 5}`;
      case 'rectangle':
        return `2 × (${shape.dimensions?.length} + ${shape.dimensions?.width}) = ${2 * ((shape.dimensions?.length || 0) + (shape.dimensions?.width || 0))}`;
      case 'square':
        return `4 × ${shape.dimensions?.side} = ${4 * (shape.dimensions?.side || 0)}`;
      default:
        return '';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <GameHeader
          title={language === 'odia' ? 'ଆକୃତି ନିର୍ମାତା' : 'Shape Builder'}
          xp={gameState.totalXp}
          onBack={() => window.history.back()}
          language={language}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Progress value={currentProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}: {currentProgress}%
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Shapes Panel */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'odia' ? 'ଆକୃତିସମୂହ' : 'Shapes'}
                </h3>
                <div className="space-y-3">
                  {shapes.map((shape) => (
                    <MathDraggableElement
                      key={shape.id}
                      element={shape}
                      language={language}
                      disabled={shape.used}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Building Zone */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'odia' ? 'ନିର୍ମାଣ କ୍ଷେତ୍ର' : 'Building Zone'}
                </h3>
                <div className="grid grid-cols-1 gap-4 min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300">
                  <MathDropZone
                    type="triangle"
                    onDrop={handleShapeDrop}
                    active={!gameState.trianglePlaced}
                    label={language === 'odia' ? 'ତ୍ରିଭୁଜ ଏଠାରେ ଛାଡ଼ନ୍ତୁ' : 'Drop Triangle Here'}
                    position="top"
                  />
                  <MathDropZone
                    type="rectangle"
                    onDrop={handleShapeDrop}
                    active={!gameState.rectanglePlaced}
                    label={language === 'odia' ? 'ଆୟତ ଏଠାରେ ଛାଡ଼ନ୍ତୁ' : 'Drop Rectangle Here'}
                    position="center"
                  />
                  <MathDropZone
                    type="square"
                    onDrop={handleShapeDrop}
                    active={!gameState.squarePlaced}
                    label={language === 'odia' ? 'ବର୍ଗ ଏଠାରେ ଛାଡ଼ନ୍ତୁ' : 'Drop Square Here'}
                    position="bottom"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calculation Panel */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'odia' ? 'ଗଣନା' : 'Calculations'}
                </h3>
                
                <AnimatePresence>
                  {showCalculation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {shapes.filter(s => s.used).map((shape) => (
                        <div key={shape.id} className="border rounded-lg p-4 space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <shape.icon className="h-4 w-4" />
                            {language === 'odia' ? shape.nameOdia : shape.name}
                          </h4>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">
                                {language === 'odia' ? 'କ୍ଷେତ୍ରଫଳ:' : 'Area:'}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {getAreaFormula(shape)}
                              </div>
                              {!gameState.areaCalculated && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCalculation('area')}
                                  className="mt-2"
                                >
                                  {language === 'odia' ? 'ଗଣନା କରନ୍ତୁ' : 'Calculate'}
                                </Button>
                              )}
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-medium">
                                {language === 'odia' ? 'ପରିସୀମା:' : 'Perimeter:'}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {getPerimeterFormula(shape)}
                              </div>
                              {gameState.areaCalculated && !gameState.perimeterCalculated && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCalculation('perimeter')}
                                  className="mt-2"
                                >
                                  {language === 'odia' ? 'ଗଣନା କରନ୍ତୁ' : 'Calculate'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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
          gameName="Shape Building"
          onPlayAgain={() => {
            setShowCompletion(false);
            setGameState({
              trianglePlaced: false,
              rectanglePlaced: false,
              squarePlaced: false,
              areaCalculated: false,
              perimeterCalculated: false,
              totalXp: 0,
              completed: false
            });
            setCurrentProgress(0);
            setShowCalculation(false);
          }}
          onReturnHome={() => window.location.href = '/'}
          xpEarned={gameState.totalXp + 20}
          badgeName="Shape Genius"
          language={language}
        />
      </div>
    </DndProvider>
  );
};