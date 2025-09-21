import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { ShapeBuilderGame } from './mathematics/ShapeBuilderGame';
import { NumberAdventureGame } from './mathematics/NumberAdventureGame';
import { ArrowLeft, Triangle, MapPin } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  titleOdia: string;
  description: string;
  descriptionOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export const MathematicsGame: React.FC = () => {
  const { language } = useUserStore();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules: Module[] = [
    {
      id: 'shape-builder',
      title: 'Shape Builder',
      titleOdia: 'ଆକୃତି ନିର୍ମାତା',
      description: 'Drag and drop shapes to build polygons, then calculate area and perimeter',
      descriptionOdia: 'ବହୁଭୁଜ ନିର୍ମାଣ ପାଇଁ ଆକୃତି ଡ୍ରାଗ୍ ଏବଂ ଡ୍ରପ୍ କରନ୍ତୁ, ତାପରେ କ୍ଷେତ୍ରଫଳ ଏବଂ ପରିସୀମା ଗଣନା କରନ୍ତୁ',
      icon: Triangle,
      component: ShapeBuilderGame
    },
    {
      id: 'number-adventure',
      title: 'Number Adventure',
      titleOdia: 'ସଂଖ୍ୟା ଦୁଃସାହସିକ କାର୍ଯ୍ୟ',
      description: 'Solve math equations to progress through an adventure map',
      descriptionOdia: 'ଦୁଃସାହସିକ ମାନଚିତ୍ରରେ ଅଗ୍ରଗତି ପାଇଁ ଗାଣିତିକ ସମୀକରଣ ସମାଧାନ କରନ୍ତୁ',
      icon: MapPin,
      component: NumberAdventureGame
    }
  ];

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  if (selectedModule && selectedModuleData) {
    const ModuleComponent = selectedModuleData.component;
    return <ModuleComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'odia' ? 'ଘରକୁ ଫେରିବା' : 'Back to Home'}
              </Button>
              <h1 className="text-2xl font-bold">
                {language === 'odia' ? 'ଗଣିତ ମଡ୍ୟୁଲ୍' : 'Mathematics Modules'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'odia' ? 'କ୍ଲାସ ୬ ଗଣିତ' : 'Class 6 Mathematics'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'odia' 
              ? 'ଇଣ୍ଟରାକ୍ଟିଭ ଗେମ୍ସ ମାଧ୍ୟମରେ ଗାଣିତିକ ଧାରଣା ଶିଖନ୍ତୁ ଏବଂ ଦକ୍ଷତା ବୃଦ୍ଧି କରନ୍ତୁ'
              : 'Learn mathematical concepts and build skills through interactive games'
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <module.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'odia' ? module.titleOdia : module.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {language === 'odia' ? module.descriptionOdia : module.description}
                  </p>
                  
                  <Button
                    onClick={() => setSelectedModule(module.id)}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {language === 'odia' ? 'ଖେଳ ଆରମ୍ଭ କରନ୍ତୁ' : 'Start Game'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};