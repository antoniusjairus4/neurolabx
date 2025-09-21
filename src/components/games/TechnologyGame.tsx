import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cpu } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { LogicGateGame } from './technology/LogicGateGame';

interface Module {
  id: string;
  title: string;
  titleOdia: string;
  description: string;
  descriptionOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export const TechnologyGame: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUserStore();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules: Module[] = [
    {
      id: 'logic_gate_6',
      title: 'Logic Gate Simulator',
      titleOdia: 'ଲଜିକ ଗେଟ ସିମୁଲେଟର',
      description: 'Build digital circuits using AND, OR, and NOT gates to make the bulb light up',
      descriptionOdia: 'ବଲ୍ବ ଜଳାଇବା ପାଇଁ AND, OR, ଏବଂ NOT ଗେଟ ବ୍ୟବହାର କରି ଡିଜିଟାଲ ସର୍କିଟ ନିର୍ମାଣ କରନ୍ତୁ',
      icon: Cpu,
      component: LogicGateGame,
    },
  ];

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  if (selectedModuleData) {
    const ModuleComponent = selectedModuleData.component;
    return <ModuleComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-technology">
              {language === 'odia' ? 'ପ୍ରଯୁକ୍ତି' : 'Technology'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'odia' 
                ? 'ଅତ୍ୟାଧୁନିକ ଟେକ୍ନୋଲୋଜି ଧାରଣା ଏବଂ ପ୍ରୟୋଗ ଶିଖନ୍ତୁ'
                : 'Learn cutting-edge technology concepts and applications'
              }
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card 
              key={module.id} 
              className="group hover:shadow-lg transition-all duration-300 border-technology/20 hover:border-technology/40"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-technology/10 text-technology group-hover:scale-110 transition-transform">
                    <module.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-technology">
                    {language === 'odia' ? module.titleOdia : module.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {language === 'odia' ? module.descriptionOdia : module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSelectedModule(module.id)}
                  className="w-full bg-technology hover:bg-technology/90 text-technology-foreground group-hover:scale-105 transition-transform"
                  size="lg"
                >
                  {language === 'odia' ? 'ଖେଳ ଆରମ୍ଭ କରନ୍ତୁ' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};