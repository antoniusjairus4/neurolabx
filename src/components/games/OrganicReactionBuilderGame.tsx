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
import { GameHeader } from './components/GameHeader';
import { CompletionModal } from './components/CompletionModal';
import { ScientificFactPopup } from './components/ScientificFactPopup';
import { ReactionComponent } from './chemistry/ReactionComponent';
import { ReactionSlot } from './chemistry/ReactionSlot';
import { ReactionTypeSelector } from './chemistry/ReactionTypeSelector';
import { TestTube, Beaker, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChemicalFact {
  title: string;
  titleOdia: string;
  description: string;
  descriptionOdia: string;
  type: string;
}

interface ChemicalComponent {
  id: string;
  name: string;
  nameOdia: string;
  type: 'reactant' | 'reagent';
  category: string;
  icon: string;
  used: boolean;
}

interface ValidReaction {
  reactant: string;
  reagent: string;
  reactionType: string;
  product: string;
  badge: string;
  xpReward: number;
}

interface GameState {
  selectedReactant: string | null;
  selectedReagent: string | null;
  selectedReactionType: string | null;
  completedReactions: ValidReaction[];
  totalXp: number;
  completed: boolean;
  currentProduct: string | null;
}

const validCombinations: ValidReaction[] = [
  {
    reactant: "2-bromo propane",
    reagent: "NaOH",
    reactionType: "SN2",
    product: "Propan-2-ol",
    badge: "Nucleophile Ninja",
    xpReward: 30
  },
  {
    reactant: "Acetaldehyde",
    reagent: "NaOH",
    reactionType: "Aldol Condensation",
    product: "3-Hydroxybutanal",
    badge: "Aldol Alchemist",
    xpReward: 30
  },
  {
    reactant: "Ethanol",
    reagent: "HCl",
    reactionType: "Elimination (E1)",
    product: "Ethene",
    badge: "Elimination Expert",
    xpReward: 30
  }
];

export const OrganicReactionBuilderGame: React.FC = () => {
  const { user } = useAuth();
  const { language, updateProgress, addBadge, profile } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>({
    selectedReactant: null,
    selectedReagent: null,
    selectedReactionType: null,
    completedReactions: [],
    totalXp: 0,
    completed: false,
    currentProduct: null,
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [reactionAnimation, setReactionAnimation] = useState(false);
  const [currentFact, setCurrentFact] = useState<ChemicalFact | null>(null);
  const [showFactPopup, setShowFactPopup] = useState(false);

  // Chemical facts for each reaction type
  const chemicalFacts: Record<string, ChemicalFact> = {
    'SN2': {
      title: 'SN2 Mechanism',
      titleOdia: 'SN2 ପଦ୍ଧତି',
      description: 'In SN2 reactions, the nucleophile attacks the carbon atom from the opposite side of the leaving group, resulting in inversion of configuration. This is a concerted, one-step mechanism.',
      descriptionOdia: 'SN2 ପ୍ରତିକ୍ରିୟାରେ, ନ୍ୟୁକ୍ଲିଓଫାଇଲ୍ କାର୍ବନ ପରମାଣୁକୁ ଛାଡିବା ଗୋଷ୍ଠୀର ବିପରୀତ ପାର୍ଶ୍ୱରୁ ଆକ୍ରମଣ କରେ, ଯାହାଫଳରେ ସଂରଚନାର ବିପରୀତତା ଘଟେ।',
      type: 'SN2',
    },
    'Aldol Condensation': {
      title: 'Aldol Condensation',
      titleOdia: 'ଆଲଡୋଲ୍ ଘନୀଭବନ',
      description: 'Aldol condensation involves the formation of C-C bonds between carbonyl compounds. An enolate ion attacks another carbonyl compound to form a β-hydroxy carbonyl compound.',
      descriptionOdia: 'ଆଲଡୋଲ୍ ଘନୀଭବନରେ କାର୍ବୋନିଲ୍ ଯୌଗିକ ମଧ୍ୟରେ C-C ବନ୍ଧନ ଗଠନ ହୁଏ। ଏକ ଏନୋଲେଟ୍ ଆୟନ ଅନ୍ୟ କାର୍ବୋନିଲ୍ ଯୌଗିକକୁ ଆକ୍ରମଣ କରି β-ହାଇଡ୍ରକ୍ସି କାର୍ବୋନିଲ୍ ଯୌଗିକ ଗଠନ କରେ।',
      type: 'Aldol Condensation',
    },
    'Elimination (E1)': {
      title: 'E1 Elimination',
      titleOdia: 'E1 ନିଷ୍କାସନ',
      description: 'E1 elimination is a two-step mechanism where the leaving group departs first to form a carbocation intermediate, followed by proton removal to form a double bond.',
      descriptionOdia: 'E1 ନିଷ୍କାସନ ଏକ ଦୁଇ-ପର୍ଯ୍ୟାୟ ପଦ୍ଧତି ଯେଉଁଠାରେ ଛାଡିବା ଗୋଷ୍ଠୀ ପ୍ରଥମେ ଚାଲିଯାଇ କାର୍ବୋକେସନ୍ ମଧ୍ୟବର୍ତ୍ତୀ ଗଠନ କରେ, ତାପରେ ପ୍ରୋଟନ୍ ଅପସାରଣ ଦ୍ୱାରା ଦ୍ୱିତୀୟ ବନ୍ଧନ ଗଠନ ହୁଏ।',
      type: 'Elimination (E1)',
    },
  };

  const reactants: ChemicalComponent[] = [
    {
      id: 'bromo-propane',
      name: '2-bromo propane',
      nameOdia: '୨-ବ୍ରୋମୋ ପ୍ରୋପେନ',
      type: 'reactant',
      category: 'alkyl halide',
      icon: '🧪',
      used: false,
    },
    {
      id: 'acetaldehyde',
      name: 'Acetaldehyde',
      nameOdia: 'ଏସେଟାଲଡିହାଇଡ',
      type: 'reactant',
      category: 'aldehyde',
      icon: '⚗️',
      used: false,
    },
    {
      id: 'acetone',
      name: 'Acetone',
      nameOdia: 'ଏସେଟୋନ',
      type: 'reactant',
      category: 'ketone',
      icon: '🧴',
      used: false,
    },
    {
      id: 'ethanol',
      name: 'Ethanol',
      nameOdia: 'ଇଥାନଲ',
      type: 'reactant',
      category: 'alcohol',
      icon: '🍶',
      used: false,
    },
  ];

  const reagents: ChemicalComponent[] = [
    {
      id: 'naoh',
      name: 'NaOH',
      nameOdia: 'NaOH',
      type: 'reagent',
      category: 'base',
      icon: '🧂',
      used: false,
    },
    {
      id: 'hcl',
      name: 'HCl',
      nameOdia: 'HCl',
      type: 'reagent',
      category: 'acid',
      icon: '🥃',
      used: false,
    },
    {
      id: 'ethanol-solvent',
      name: 'CH3CH2OH',
      nameOdia: 'CH3CH2OH',
      type: 'reagent',
      category: 'solvent',
      icon: '💧',
      used: false,
    },
    {
      id: 'heat',
      name: 'Heat',
      nameOdia: 'ତାପ',
      type: 'reagent',
      category: 'catalyst',
      icon: '🔥',
      used: false,
    },
  ];

  const reactionTypes = [
    'SN1',
    'SN2',
    'Aldol Condensation',
    'Elimination (E1)',
    'Elimination (E2)',
  ];

  const handleComponentDrop = (componentName: string, slotType: 'reactant' | 'reagent') => {
    setGameState(prev => ({
      ...prev,
      [slotType === 'reactant' ? 'selectedReactant' : 'selectedReagent']: componentName,
    }));
  };

  const handleReactionTypeSelect = (reactionType: string) => {
    setGameState(prev => ({
      ...prev,
      selectedReactionType: reactionType,
    }));
  };

  const attemptReaction = async () => {
    const { selectedReactant, selectedReagent, selectedReactionType } = gameState;
    
    if (!selectedReactant || !selectedReagent || !selectedReactionType) {
      toast({
        title: language === 'odia' ? 'ଅସମ୍ପୂର୍ଣ୍ଣ' : 'Incomplete',
        description: language === 'odia' ? 'ସମସ୍ତ ଉପାଦାନ ବାଛନ୍ତୁ' : 'Please select all components',
        variant: 'destructive',
      });
      return;
    }

    const validReaction = validCombinations.find(
      combo => combo.reactant === selectedReactant && 
               combo.reagent === selectedReagent && 
               combo.reactionType === selectedReactionType
    );

    setReactionAnimation(true);
    
    setTimeout(async () => {
      if (validReaction) {
        // Success
        setGameState(prev => {
          const newCompletedReactions = [...prev.completedReactions, validReaction];
          const newTotalXp = prev.totalXp + validReaction.xpReward;
          const isCompleted = newCompletedReactions.length === validCombinations.length;
          const finalXp = isCompleted ? newTotalXp + 100 : newTotalXp; // Completion bonus
          
          return {
            ...prev,
            completedReactions: newCompletedReactions,
            totalXp: finalXp,
            completed: isCompleted,
            currentProduct: validReaction.product,
            selectedReactant: null,
            selectedReagent: null,
            selectedReactionType: null,
          };
        });

        toast({
          title: language === 'odia' ? 'ସଫଳ!' : 'Success!',
          description: language === 'odia' ? 'ସଠିକ୍ ପ୍ରତିକ୍ରିୟା!' : 'Correct reaction! Product synthesized successfully.',
        });

        // Show educational fact popup
        const fact = chemicalFacts[validReaction.reactionType];
        if (fact) {
          setCurrentFact(fact);
          setShowFactPopup(true);
        }

        // Update progress and badges
        if (user) {
          await updateProgress(validReaction.xpReward, 0);
          await addBadge(validReaction.badge, 'Class 12 Chemistry');

          // Update module completion
          const currentClass = profile?.class || 12;
          const moduleId = `organic_reaction_${currentClass}`;
          
          try {
            const { data: existingCompletion } = await supabase
              .from('module_completion')
              .select('*')
              .eq('user_id', user.id)
              .eq('module_id', moduleId)
              .single();

            const completionData = {
              completion_status: gameState.completedReactions.length + 1 === validCombinations.length ? 'completed' : 'in_progress',
              xp_earned: gameState.totalXp + validReaction.xpReward,
              attempts: (existingCompletion?.attempts || 0) + 1,
              best_score: Math.max(existingCompletion?.best_score || 0, gameState.totalXp + validReaction.xpReward),
            };

            if (existingCompletion) {
              await supabase
                .from('module_completion')
                .update(completionData)
                .eq('user_id', user.id)
                .eq('module_id', moduleId);
            } else {
              await supabase
                .from('module_completion')
                .insert({ user_id: user.id, module_id: moduleId, ...completionData });
            }

            // Check if game completed
            if (gameState.completedReactions.length + 1 === validCombinations.length) {
              await addBadge('Reaction Master', 'Class 12 Chemistry');
              // Delay showing completion modal if fact popup is shown
              setTimeout(() => {
                if (!showFactPopup) setShowCompletion(true);
              }, 1000);
            }
          } catch (error) {
            console.error('Error updating module completion:', error);
          }
        }
      } else {
        // Failure
        toast({
          title: language === 'odia' ? 'ଭୁଲ୍' : 'Incorrect',
          description: language === 'odia' ? 'ଭୁଲ୍ ମିଶ୍ରଣ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Incorrect combination. Review the mechanism and try again.',
          variant: 'destructive',
        });

        setGameState(prev => ({
          ...prev,
          selectedReactant: null,
          selectedReagent: null,
          selectedReactionType: null,
          currentProduct: null,
        }));
      }

      setReactionAnimation(false);
    }, 2000);
  };

  const resetGame = () => {
    setGameState({
      selectedReactant: null,
      selectedReagent: null,
      selectedReactionType: null,
      completedReactions: [],
      totalXp: 0,
      completed: false,
      currentProduct: null,
    });
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

  const getCompletionPercentage = () => {
    return (gameState.completedReactions.length / validCombinations.length) * 100;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-science/5 via-background to-engineering/5">
        <GameHeader 
          title={language === 'odia' ? 'ଜୈବିକ ପ୍ରତିକ୍ରିୟା ନିର୍ମାଣକାରୀ' : 'Organic Reaction Builder'}
          xp={gameState.totalXp}
          onBack={() => navigate('/')}
          language={language}
          subject={language === 'odia' ? 'କ୍ଲାସ ୧୨ ରସାୟନ' : 'Class 12 Chemistry'}
        />

        <main className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reactants Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-science">
                  <TestTube className="h-5 w-5" />
                  {language === 'odia' ? 'ବିକ୍ରିୟାକାରୀ' : 'Reactants'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reactants.map((component) => (
                  <ReactionComponent
                    key={component.id}
                    component={component}
                    language={language}
                    onDrop={handleComponentDrop}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Reagents Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-engineering">
                  <Beaker className="h-5 w-5" />
                  {language === 'odia' ? 'ପରୀକ୍ଷକ' : 'Reagents'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reagents.map((component) => (
                  <ReactionComponent
                    key={component.id}
                    component={component}
                    language={language}
                    onDrop={handleComponentDrop}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Reaction Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {language === 'odia' ? 'ପ୍ରତିକ୍ରିୟା କ୍ଷେତ୍ର' : 'Reaction Area'}
                </CardTitle>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {Math.round(getCompletionPercentage())}%
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {gameState.totalXp} XP
                  </Badge>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2" />
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Reaction Slots */}
                <div className="space-y-4">
                  <ReactionSlot
                    type="reactant"
                    selectedComponent={gameState.selectedReactant}
                    onDrop={handleComponentDrop}
                    language={language}
                  />
                  
                  <div className="text-center text-2xl font-bold text-muted-foreground">+</div>
                  
                  <ReactionSlot
                    type="reagent"
                    selectedComponent={gameState.selectedReagent}
                    onDrop={handleComponentDrop}
                    language={language}
                  />
                </div>

                {/* Reaction Type Selector */}
                <ReactionTypeSelector
                  types={reactionTypes}
                  selectedType={gameState.selectedReactionType}
                  onSelect={handleReactionTypeSelect}
                  language={language}
                />

                {/* Reaction Button */}
                <Button
                  onClick={attemptReaction}
                  disabled={!gameState.selectedReactant || !gameState.selectedReagent || !gameState.selectedReactionType || reactionAnimation}
                  className="w-full gap-2"
                  size="lg"
                >
                  {reactionAnimation ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⚡
                    </motion.div>
                  ) : (
                    '⚡'
                  )}
                  {language === 'odia' ? 'ପ୍ରତିକ୍ରିୟା ଆରମ୍ଭ' : 'Start Reaction'}
                </Button>

                {/* Product Display */}
                {gameState.currentProduct && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-badge/10 to-badge/5 rounded-lg border border-badge/20 text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'odia' ? 'ଉତ୍ପାଦ' : 'Product'}
                    </p>
                    <p className="font-bold text-badge text-lg">{gameState.currentProduct}</p>
                  </motion.div>
                )}

                {/* Completed Reactions */}
                {gameState.completedReactions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === 'odia' ? 'সমাপ্ত প্রতিক্রিয়া' : 'Completed Reactions'}
                    </p>
                    {gameState.completedReactions.map((reaction, index) => (
                      <div key={index} className="p-2 bg-science/10 rounded text-sm">
                        {reaction.reactant} + {reaction.reagent} → {reaction.product}
                      </div>
                    ))}
                  </div>
                )}

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
              badgeName="Reaction Master"
              language={language}
              gameName="Organic Reaction Builder"
            />
          )}
        </AnimatePresence>

        {/* Chemical Fact Popup */}
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