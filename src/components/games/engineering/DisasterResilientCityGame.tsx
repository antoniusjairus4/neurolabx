import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { ScientificFactPopup } from '../components/ScientificFactPopup';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building, Zap, Waves, Wind, AlertTriangle, Shield, Hammer } from 'lucide-react';

interface Material {
  name: string;
  strength: string;
  cost: string;
  resilience: {
    earthquake: number;
    flood: number;
    storm: number;
  };
}

interface Zone {
  name: string;
  risk: string;
  idealMaterial: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlacedStructure {
  id: string;
  type: string;
  material: Material;
  zone: string;
  x: number;
  y: number;
  survived: boolean;
}

interface DisasterResilientCityGameProps {
  onBack: () => void;
  language: 'english' | 'odia';
}

const materials: Material[] = [
  {
    name: 'Wood',
    strength: 'Low',
    cost: 'Low',
    resilience: { earthquake: 1, flood: 1, storm: 2 }
  },
  {
    name: 'Steel',
    strength: 'High',
    cost: 'High',
    resilience: { earthquake: 3, flood: 2, storm: 3 }
  },
  {
    name: 'Composite',
    strength: 'Medium',
    cost: 'Medium',
    resilience: { earthquake: 2, flood: 3, storm: 2 }
  }
];

const zones: Zone[] = [
  { name: 'Fault Line Zone', risk: 'High Earthquake', idealMaterial: 'Steel', x: 10, y: 10, width: 180, height: 120 },
  { name: 'Flood Plain', risk: 'High Flood', idealMaterial: 'Composite', x: 200, y: 10, width: 180, height: 120 },
  { name: 'Coastal Area', risk: 'High Storm', idealMaterial: 'Steel', x: 10, y: 140, width: 180, height: 120 },
  { name: 'Safe Zone', risk: 'Low', idealMaterial: 'Any', x: 200, y: 140, width: 180, height: 120 }
];

const structures = ['Residential Building', 'Hospital', 'School', 'Power Station'];

const MaterialPalette: React.FC<{ 
  selectedMaterial: Material | null;
  onMaterialSelect: (material: Material) => void;
  language: 'english' | 'odia';
}> = ({ selectedMaterial, onMaterialSelect, language }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Hammer className="h-4 w-4" />
          {language === 'odia' ? 'ନିର୍ମାଣ ସାମଗ୍ରୀ' : 'Building Materials'}
        </h3>
        <div className="space-y-2">
          {materials.map((material) => (
            <motion.div
              key={material.name}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedMaterial?.name === material.name
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onMaterialSelect(material)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-medium">{material.name}</div>
              <div className="text-xs text-muted-foreground">
                Strength: {material.strength} • Cost: {material.cost}
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  🏗️ {material.resilience.earthquake}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🌊 {material.resilience.flood}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🌪️ {material.resilience.storm}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StructurePalette: React.FC<{ 
  selectedMaterial: Material | null;
  language: 'english' | 'odia';
}> = ({ selectedMaterial, language }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Building className="h-4 w-4" />
          {language === 'odia' ? 'ଗଠନ' : 'Structures'}
        </h3>
        {!selectedMaterial && (
          <p className="text-sm text-muted-foreground mb-3">
            {language === 'odia' ? 'ପ୍ରଥମେ ସାମଗ୍ରୀ ବାଛନ୍ତୁ' : 'Select material first'}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {structures.map((structure) => (
            <DraggableStructure
              key={structure}
              structure={structure}
              selectedMaterial={selectedMaterial}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DraggableStructure: React.FC<{
  structure: string;
  selectedMaterial: Material | null;
}> = ({ structure, selectedMaterial }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'structure',
    item: { structure, material: selectedMaterial },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !!selectedMaterial,
  });

  const getStructureIcon = (structure: string) => {
    switch (structure) {
      case 'Residential Building': return '🏠';
      case 'Hospital': return '🏥';
      case 'School': return '🏫';
      case 'Power Station': return '⚡';
      default: return '🏢';
    }
  };

  return (
    <motion.div
      ref={selectedMaterial ? drag : null}
      className={`p-3 border rounded-lg text-center transition-all ${
        selectedMaterial 
          ? 'cursor-move hover:bg-primary/10 border-primary/20' 
          : 'cursor-not-allowed opacity-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      whileHover={selectedMaterial ? { scale: 1.05 } : {}}
    >
      <div className="text-2xl mb-1">{getStructureIcon(structure)}</div>
      <div className="text-xs font-medium">{structure}</div>
    </motion.div>
  );
};

const CityMap: React.FC<{
  structures: PlacedStructure[];
  onStructureDrop: (structure: string, material: Material, x: number, y: number, zone: string) => void;
  language: 'english' | 'odia';
}> = ({ structures, onStructureDrop, language }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'structure',
    drop: (item: { structure: string; material: Material }, monitor) => {
      const offset = monitor.getClientOffset();
      const dropTargetElement = document.getElementById('city-map');
      if (offset && dropTargetElement) {
        const rect = dropTargetElement.getBoundingClientRect();
        const x = offset.x - rect.left;
        const y = offset.y - rect.top;
        
        // Determine which zone the structure was dropped in
        const zone = zones.find(z => 
          x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height
        );
        
        if (zone && item.material) {
          onStructureDrop(item.structure, item.material, x, y, zone.name);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getZoneColor = (zone: Zone) => {
    switch (zone.name) {
      case 'Fault Line Zone': return 'bg-red-100 border-red-300';
      case 'Flood Plain': return 'bg-blue-100 border-blue-300';
      case 'Coastal Area': return 'bg-purple-100 border-purple-300';
      case 'Safe Zone': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getRiskIcon = (zone: Zone) => {
    switch (zone.name) {
      case 'Fault Line Zone': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Flood Plain': return <Waves className="h-4 w-4 text-blue-600" />;
      case 'Coastal Area': return <Wind className="h-4 w-4 text-purple-600" />;
      case 'Safe Zone': return <Shield className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">
          {language === 'odia' ? 'ସହର ମାନଚିତ୍ର' : 'City Map'}
        </h3>
        <div
          id="city-map"
          ref={drop}
          className={`relative w-full h-80 border-2 border-dashed rounded-lg transition-colors ${
            isOver ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          {/* Render zones */}
          {zones.map((zone) => (
            <div
              key={zone.name}
              className={`absolute border-2 rounded ${getZoneColor(zone)}`}
              style={{
                left: zone.x,
                top: zone.y,
                width: zone.width,
                height: zone.height,
              }}
            >
              <div className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  {getRiskIcon(zone)}
                  <span className="text-xs font-medium">{zone.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{zone.risk}</div>
              </div>
            </div>
          ))}

          {/* Render placed structures */}
          {structures.map((structure) => (
            <motion.div
              key={structure.id}
              className={`absolute w-8 h-8 rounded border-2 flex items-center justify-center text-xs ${
                structure.survived 
                  ? 'bg-green-100 border-green-400' 
                  : 'bg-red-100 border-red-400'
              }`}
              style={{ left: structure.x - 16, top: structure.y - 16 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              🏢
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const DisasterResilientCityGame: React.FC<DisasterResilientCityGameProps> = ({ onBack, language }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [structures, setStructures] = useState<PlacedStructure[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFactPopup, setShowFactPopup] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const handleStructureDrop = useCallback((structure: string, material: Material, x: number, y: number, zone: string) => {
    const newStructure: PlacedStructure = {
      id: `structure-${Date.now()}`,
      type: structure,
      material,
      zone,
      x,
      y,
      survived: true
    };

    setStructures(prev => [...prev, newStructure]);
    toast.success(`${material.name} ${structure} placed in ${zone}`);
  }, []);

  const runDisasterSimulation = useCallback(async () => {
    if (structures.length === 0) {
      toast.error(language === 'odia' ? 'ପ୍ରଥମେ କିଛି ଗଠନ ରଖନ୍ତୁ' : 'Place some structures first');
      return;
    }

    setSimulationRunning(true);
    
    // Simulate disasters and calculate survival
    const updatedStructures = structures.map(structure => {
      const zone = zones.find(z => z.name === structure.zone);
      let survived = true;
      
      if (zone) {
        // Calculate survival based on material resilience vs zone risk
        let requiredResilience = 1;
        
        switch (zone.name) {
          case 'Fault Line Zone':
            requiredResilience = structure.material.resilience.earthquake;
            break;
          case 'Flood Plain':
            requiredResilience = structure.material.resilience.flood;
            break;
          case 'Coastal Area':
            requiredResilience = structure.material.resilience.storm;
            break;
          case 'Safe Zone':
            requiredResilience = 3; // Always survives in safe zone
            break;
        }
        
        survived = requiredResilience >= 2; // Minimum resilience threshold
      }
      
      return { ...structure, survived };
    });

    setStructures(updatedStructures);

    // Calculate score
    const survivedCount = updatedStructures.filter(s => s.survived).length;
    const totalCount = updatedStructures.length;
    const survivalRate = (survivedCount / totalCount) * 100;

    setTimeout(() => {
      setSimulationRunning(false);
      
      if (survivalRate >= 70) {
        const earnedXp = 60;
        setXp(prev => prev + earnedXp);

        if (user) {
          // Update user progress and badge
          supabase
            .from('user_progress')
            .select('total_xp')
            .eq('user_id', user.id)
            .single()
            .then(({ data: currentProgress }) => {
              if (currentProgress) {
                supabase
                  .from('user_progress')
                  .update({ total_xp: currentProgress.total_xp + earnedXp })
                  .eq('user_id', user.id)
                  .then();
              }
            });

          // Record module completion
          supabase
            .from('module_completion')
            .upsert({
              user_id: user.id,
              module_id: 'disaster-resilient-city-grade-12',
              completion_status: 'completed',
              xp_earned: earnedXp,
              attempts: 1,
              best_score: Math.round(survivalRate)
            })
            .then();

          // Add badge
          supabase
            .from('badges')
            .insert({
              user_id: user.id,
              badge_name: 'Disaster Engineer',
              module_name: 'Disaster-Resilient City Builder'
            })
            .then();
        }

        setShowCompletion(true);
        toast.success(language === 'odia' 
          ? 'ଉତ୍କୃଷ୍ଟ! ତୁମର ସହର ସମସ୍ତ ବିପର୍ଯ୍ୟୟକୁ ସହ୍ୟ କଲା!'
          : 'Excellent! Your city withstood all disasters!'
        );
      } else {
        toast.error(language === 'odia'
          ? `${survivedCount}/${totalCount} ଗଠନ ବଞ୍ଚିଲା। ଉନ୍ନତ ଯୋଜନା ସହିତ ପୁନର୍ନିର୍ମାଣ କରନ୍ତୁ।`
          : `${survivedCount}/${totalCount} structures survived. Rebuild with better planning.`
        );
      }
    }, 2000);
  }, [structures, user, language]);

  const resetCity = () => {
    setStructures([]);
    setXp(0);
    setSelectedMaterial(null);
  };

  const handlePlayAgain = () => {
    resetCity();
    setShowCompletion(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <GameHeader
          title={language === 'odia' ? 'ବିପର୍ଯ୍ୟୟ-ପ୍ରତିରୋଧକ ସହର ନିର୍ମାତା' : 'Disaster-Resilient City Builder'}
          xp={xp}
          onBack={onBack}
          language={language}
          subject="Engineering"
        />

        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Materials Panel */}
            <div className="lg:col-span-1 space-y-4">
              <MaterialPalette
                selectedMaterial={selectedMaterial}
                onMaterialSelect={setSelectedMaterial}
                language={language}
              />
              
              <StructurePalette
                selectedMaterial={selectedMaterial}
                language={language}
              />

              <div className="space-y-2">
                <Button
                  onClick={runDisasterSimulation}
                  disabled={simulationRunning || structures.length === 0}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {simulationRunning 
                    ? (language === 'odia' ? 'ସିମୁଲେଶନ୍...' : 'Simulating...')
                    : (language === 'odia' ? 'ବିପର୍ଯ୍ୟୟ ପରୀକ୍ଷା' : 'Test Disasters')
                  }
                </Button>

                <Button variant="outline" onClick={resetCity} className="w-full">
                  {language === 'odia' ? 'ପୁନଃସେଟ୍ କରନ୍ତୁ' : 'Reset City'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowFactPopup(true)}
                  className="w-full"
                >
                  {language === 'odia' ? 'ଇଞ୍ଜିନିୟରିଂ ତଥ୍ୟ' : 'Engineering Facts'}
                </Button>
              </div>
            </div>

            {/* City Map */}
            <div className="lg:col-span-3">
              <CityMap
                structures={structures}
                onStructureDrop={handleStructureDrop}
                language={language}
              />

              {/* Statistics */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">
                    {language === 'odia' ? 'ସହର ପରିସଂଖ୍ୟାନ' : 'City Statistics'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'odia' ? 'ମୋଟ ଗଠନ' : 'Total Structures'}
                      </div>
                      <div className="text-2xl font-bold">{structures.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'odia' ? 'ବଞ୍ଚିତ ଗଠନ' : 'Surviving Structures'}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {structures.filter(s => s.survived).length}
                      </div>
                    </div>
                  </div>
                  {structures.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        {language === 'odia' ? 'ବଞ୍ଚିବାର ହାର' : 'Survival Rate'}
                      </div>
                      <Progress 
                        value={(structures.filter(s => s.survived).length / structures.length) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <CompletionModal
          isOpen={showCompletion}
          onClose={() => setShowCompletion(false)}
          onPlayAgain={handlePlayAgain}
          onReturnHome={onBack}
          xpEarned={60}
          badgeName="Disaster Engineer"
          gameName="Disaster-Resilient City Builder"
          language={language}
        />

        <ScientificFactPopup
          isOpen={showFactPopup}
          onClose={() => setShowFactPopup(false)}
          fact={{
            title: language === 'odia' ? 'ବିপର୍ଯ୍ୟୟ ପ୍ରତିରୋଧକ ଇଞ୍ଜିନିୟରିଂ' : 'Disaster-Resilient Engineering',
            titleOdia: 'ବିପର୍ଯ୍ୟୟ ପ୍ରତିରୋଧକ ଇଞ୍ଜିନିୟରିଂ',
            description: language === 'odia'
              ? 'ସିଭିଲ୍ ଇଞ୍ଜିନିୟରମାନେ ଭୂକମ୍ପ, ବନ୍ୟା ଓ ଝଡ଼ ପ୍ରତିରୋଧକ ଗଠନ ଡିଜାଇନ୍ କରନ୍ତି। ସାମଗ୍ରୀ ଶକ୍ତି, ଭିତ୍ତିଭୂମି ଡିଜାଇନ୍ ଓ ସ୍ଥାନ ବାଛିବା ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ।'
              : 'Civil engineers design structures to resist earthquakes, floods, and storms. Material strength, foundation design, and site selection are crucial factors for disaster resilience.',
            descriptionOdia: 'ସିଭିଲ୍ ଇଞ୍ଜିନିୟରମାନେ ଭୂକମ୍ପ, ବନ୍ୟା ଓ ଝଡ଼ ପ୍ରତିରୋଧକ ଗଠନ ଡିଜାଇନ୍ କରନ୍ତି। ସାମଗ୍ରୀ ଶକ୍ତି, ଭିତ୍ତିଭୂମି ଡିଜାଇନ୍ ଓ ସ୍ଥାନ ବାଛିବା ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ।',
            type: 'engineering'
          }}
          language={language}
        />
      </div>
    </DndProvider>
  );
};