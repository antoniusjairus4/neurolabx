import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { GameHeader } from '../components/GameHeader';
import { Database, Cpu, ArrowRight } from 'lucide-react';

interface TechnologyGameSelectorProps {
  onBack: () => void;
  language: 'english' | 'odia';
}

const technologyGames = [
  {
    id: 'iot-smart-city',
    title: 'IoT Smart City Simulator',
    titleOdia: 'IoT ସ୍ମାର୍ଟ ସିଟି ସିମୁଲେଟର',
    description: 'Design and optimize IoT sensor networks in a smart city environment',
    descriptionOdia: 'ସ୍ମାର୍ଟ ସିଟି ପରିବେଶରେ IoT ସେନ୍ସର ନେଟୱର୍କ ଡିଜାଇନ ଏବଂ ଅପ୍ଟିମାଇଜ କରନ୍ତୁ',
    icon: Cpu,
    route: '/learning/technology/iot-smart-city',
    difficulty: 'Intermediate',
    difficultyOdia: 'ମଧ୍ୟମ',
    xp: 100,
    badge: 'IoT Architect'
  },
  {
    id: 'sql-data-dungeon',
    title: 'SQL Simulator: Data Dungeon',
    titleOdia: 'SQL ସିମୁଲେଟର: ଡାଟା ଡାଞ୍ଜନ',
    description: 'Master SQL queries by fixing a corrupted database in a digital kingdom',
    descriptionOdia: 'ଡିଜିଟାଲ ରାଜ୍ୟରେ ଦୂଷିତ ଡାଟାବେସ ଠିକ କରି SQL କ୍ୱେରୀରେ ଦକ୍ଷତା ହାସଲ କରନ୍ତୁ',
    icon: Database,
    route: '/learning/technology/sql-data-dungeon',
    difficulty: 'Advanced',
    difficultyOdia: 'ଉନ୍ନତ',
    xp: 100,
    badge: 'Query Conqueror'
  }
];

export const TechnologyGameSelector: React.FC<TechnologyGameSelectorProps> = ({ onBack, language }) => {
  const navigate = useNavigate();
  const { profile } = useUserStore();

  const handleGameSelect = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <GameHeader
        title={language === 'odia' ? 'ପ୍ରଯୁକ୍ତି ଗେମ୍ସ' : 'Technology Games'}
        xp={0}
        onBack={onBack}
        language={language}
        subject="Technology"
      />

      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'odia' ? 'ଗେମ୍ ସିଲେକ୍ଟ କରନ୍ତୁ' : 'Choose Your Game'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'odia' 
              ? `କ୍ଲାସ ${profile?.class} ପାଇଁ ଉପଲବ୍ଧ ପ୍ରଯୁକ୍ତି ଗେମ୍ସ`
              : `Available Technology games for Class ${profile?.class}`
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {technologyGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <game.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {language === 'odia' ? game.titleOdia : game.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {language === 'odia' ? game.difficultyOdia : game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.xp} XP
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {language === 'odia' ? game.descriptionOdia : game.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {language === 'odia' ? 'ବ୍ୟାଜ' : 'Badge'}: {game.badge}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleGameSelect(game.route)}
                      className="gap-2"
                    >
                      {language === 'odia' ? 'ଖେଳନ୍ତୁ' : 'Play'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};