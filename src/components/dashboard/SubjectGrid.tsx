import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { Beaker, Calculator, Cpu, Cog, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ComingSoonCard } from './ComingSoonCard';

interface Subject {
  id: string;
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  modules: number;
  completedModules: number;
  description: string;
  descriptionOdia: string;
}

export const SubjectGrid: React.FC = () => {
  const { profile, language } = useUserStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scienceCompleted, setScienceCompleted] = React.useState(0);
  const [engineeringCompleted, setEngineeringCompleted] = React.useState(0);
  const [mathCompleted, setMathCompleted] = React.useState(0);
  const [technologyCompleted, setTechnologyCompleted] = React.useState(0);

  const loadProgress = React.useCallback(async () => {
    if (!user || !profile) return;
    const currentClass = profile.class;
    
    const { data } = await supabase
      .from('module_completion')
      .select('module_id, completion_status')
      .eq('user_id', user.id);
    
    // Check class-specific modules
    const isScienceDone = data?.some(d => d.module_id === `photosynthesis_${currentClass}` && d.completion_status === 'completed');
    const isEngineeringDone = data?.some(d => d.module_id === `circuit_builder_${currentClass}` && d.completion_status === 'completed');
    const isTechnologyDone = data?.some(d => d.module_id === `logic_gate_${currentClass}` && d.completion_status === 'completed');
    
    // Check mathematics modules for current class
    const isShapeBuilderDone = data?.some(d => d.module_id === `shape_builder_${currentClass}` && d.completion_status === 'completed');
    const isNumberAdventureDone = data?.some(d => d.module_id === `number_adventure_${currentClass}` && d.completion_status === 'completed');
    const mathModulesCompleted = (isShapeBuilderDone ? 1 : 0) + (isNumberAdventureDone ? 1 : 0);
    
    setScienceCompleted(isScienceDone ? 1 : 0);
    setEngineeringCompleted(isEngineeringDone ? 1 : 0);
    setMathCompleted(mathModulesCompleted);
    setTechnologyCompleted(isTechnologyDone ? 1 : 0);
  }, [user, profile]);

  React.useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  React.useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('module_completion_updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'module_completion', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadProgress]);

  // Get module counts based on current class
  const getModuleCount = (subjectId: string, currentClass: number = 6) => {
    // Only show content for class 6 and 12, others show "coming soon"
    if (currentClass !== 6 && currentClass !== 12) {
      return 0;
    }
    
    switch (subjectId) {
      case 'science':
        return currentClass === 12 ? 3 : 1; // More advanced modules for grade 12
      case 'math':
        return currentClass === 12 ? 4 : 2; // More advanced modules for grade 12
      case 'technology':
        return currentClass === 12 ? 3 : 1; // More advanced modules for grade 12
      case 'engineering':
        return currentClass === 12 ? 3 : 1; // More advanced modules for grade 12
      default:
        return 0;
    }
  };

  const subjects: Subject[] = [
    {
      id: 'science',
      name: 'Science',
      nameOdia: 'ବିଜ୍ଞାନ',
      icon: Beaker,
      color: 'science',
      modules: getModuleCount('science', profile?.class),
      completedModules: scienceCompleted,
      description: 'Explore the natural world through interactive experiments',
      descriptionOdia: 'ଇଣ୍ଟରାକ୍ଟିଭ ପରୀକ୍ଷଣ ମାଧ୍ୟମରେ ପ୍ରାକୃତିକ ଜଗତ ଆବିଷ୍କାର କରନ୍ତୁ',
    },
    {
      id: 'math',
      name: 'Mathematics',
      nameOdia: 'ଗଣିତ',
      icon: Calculator,
      color: 'math',
      modules: getModuleCount('math', profile?.class),
      completedModules: mathCompleted,
      description: 'Master mathematical concepts with visual problem solving',
      descriptionOdia: 'ଭିଜୁଆଲ ସମସ୍ୟା ସମାଧାନ ସହିତ ଗାଣିତିକ ଧାରଣାଗୁଡ଼ିକରେ ଦକ୍ଷତା ହାସଲ କରନ୍ତୁ',
    },
    {
      id: 'technology',
      name: 'Technology',
      nameOdia: 'ପ୍ରଯୁକ୍ତି',
      icon: Cpu,
      color: 'technology',
      modules: getModuleCount('technology', profile?.class),
      completedModules: technologyCompleted,
      description: 'Learn cutting-edge technology concepts and applications',
      descriptionOdia: 'ଅତ୍ୟାଧୁନିକ ଟେକ୍ନୋଲୋଜି ଧାରଣା ଏବଂ ପ୍ରୟୋଗ ଶିଖନ୍ତୁ',
    },
    {
      id: 'engineering',
      name: 'Engineering',
      nameOdia: 'ଇଞ୍ଜିନିୟରିଂ',
      icon: Cog,
      color: 'engineering',
      modules: getModuleCount('engineering', profile?.class),
      completedModules: engineeringCompleted,
      description: 'Design and build solutions to real-world problems',
      descriptionOdia: 'ବାସ୍ତବ ଜଗତର ସମସ୍ୟାର ସମାଧାନ ଡିଜାଇନ ଏବଂ ନିର୍ମାଣ କରନ୍ତୁ',
    },
  ];

  const handleSubjectClick = (subjectId: string) => {
    if (subjectId === 'science') {
      navigate('/learning/science');
    } else if (subjectId === 'engineering') {
      navigate('/learning/engineering');
    } else if (subjectId === 'math') {
      navigate('/learning/mathematics');
    } else if (subjectId === 'technology') {
      navigate('/learning/technology');
    }
  };

  // Check if current class has content available
  const hasContent = profile?.class === 6 || profile?.class === 12;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === 'odia' ? 'ବିଷୟଗୁଡ଼ିକ' : 'Subjects'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'odia' ? `କ୍ଲାସ ${profile?.class} ପାଇଁ` : `For Class ${profile?.class}`}
        </p>
      </div>

      {!hasContent ? (
        <ComingSoonCard language={language} currentClass={profile?.class || 6} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-${subject.color}/10 text-${subject.color} group-hover:scale-110 transition-transform`}>
                      <subject.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {language === 'odia' ? subject.nameOdia : subject.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {subject.modules} {language === 'odia' ? 'ମଡ୍ୟୁଲ୍' : 'modules'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={subject.modules > 0 ? "default" : "ghost"}
                    onClick={() => handleSubjectClick(subject.id)}
                    disabled={subject.modules === 0}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {subject.completedModules === subject.modules
                      ? (language === 'odia' ? 'ପୁଣି ଶିଖ' : 'Learn Again')
                      : (language === 'odia' ? 'ଆରମ୍ଭ' : 'Start')}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'odia' ? subject.descriptionOdia : subject.description}
                </p>

                {subject.modules > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}</span>
                      <span>
                        {subject.completedModules}/{subject.modules}
                      </span>
                    </div>
                    <Progress 
                      value={(subject.completedModules / subject.modules) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                {subject.modules === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'odia' ? 'ଶୀଘ୍ର ଆସୁଛି...' : 'Coming Soon...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
};