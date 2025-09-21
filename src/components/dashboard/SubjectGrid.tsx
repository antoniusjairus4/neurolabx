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

  const loadProgress = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('module_completion')
      .select('module_id, completion_status')
      .eq('user_id', user.id);
    
    const isScienceDone = data?.some(d => d.module_id === 'photosynthesis_6' && d.completion_status === 'completed');
    const isEngineeringDone = data?.some(d => d.module_id === 'circuit_builder_6' && d.completion_status === 'completed');
    
    // Check mathematics modules
    const isShapeBuilderDone = data?.some(d => d.module_id === 'shape_builder_6' && d.completion_status === 'completed');
    const isNumberAdventureDone = data?.some(d => d.module_id === 'number_adventure_6' && d.completion_status === 'completed');
    const mathModulesCompleted = (isShapeBuilderDone ? 1 : 0) + (isNumberAdventureDone ? 1 : 0);
    
    setScienceCompleted(isScienceDone ? 1 : 0);
    setEngineeringCompleted(isEngineeringDone ? 1 : 0);
    setMathCompleted(mathModulesCompleted);
  }, [user]);

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

  const subjects: Subject[] = [
    {
      id: 'science',
      name: 'Science',
      nameOdia: 'ବିଜ୍ଞାନ',
      icon: Beaker,
      color: 'science',
      modules: 1,
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
      modules: 2,
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
      modules: 0,
      completedModules: 0,
      description: 'Learn cutting-edge technology concepts and applications',
      descriptionOdia: 'ଅତ୍ୟାଧୁନିକ ଟେକ୍ନୋଲୋଜି ଧାରଣା ଏବଂ ପ୍ରୟୋଗ ଶିଖନ୍ତୁ',
    },
    {
      id: 'engineering',
      name: 'Engineering',
      nameOdia: 'ଇଞ୍ଜିନିୟରିଂ',
      icon: Cog,
      color: 'engineering',
      modules: 1,
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
    }
  };

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
    </div>
  );
};