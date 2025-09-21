import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap, Settings } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClassSwitcherProps {
  language: 'english' | 'odia';
}

export const ClassSwitcher: React.FC<ClassSwitcherProps> = ({ language }) => {
  const { user } = useAuth();
  const { profile, fetchUserData } = useUserStore();
  const [isChanging, setIsChanging] = useState(false);

  const classes = [
    { value: 6, label: language === 'odia' ? '୬ମ ଶ୍ରେଣୀ' : 'Class 6' },
    { value: 7, label: language === 'odia' ? '୭ମ ଶ୍ରେଣୀ' : 'Class 7' },
    { value: 8, label: language === 'odia' ? '୮ମ ଶ୍ରେଣୀ' : 'Class 8' },
    { value: 9, label: language === 'odia' ? '୯ମ ଶ୍ରେଣୀ' : 'Class 9' },
    { value: 10, label: language === 'odia' ? '୧୦ମ ଶ୍ରେଣୀ' : 'Class 10' },
    { value: 11, label: language === 'odia' ? '୧୧ମ ଶ୍ରେଣୀ' : 'Class 11' },
    { value: 12, label: language === 'odia' ? '୧୨ମ ଶ୍ରେଣୀ' : 'Class 12' },
  ];

  const handleClassChange = async (newClass: string) => {
    if (!user || !profile) return;
    
    const classNumber = parseInt(newClass);
    if (classNumber === profile.class) return;

    setIsChanging(true);
    
    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ class: classNumber })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh user data to update the store
      await fetchUserData(user.id);
      
      toast.success(
        language === 'odia' 
          ? `ସଫଳତାର ସହିତ ${classNumber}ମ ଶ୍ରେଣୀକୁ ପରିବର୍ତ୍ତନ କରାଗଲା!`
          : `Successfully switched to Class ${classNumber}!`
      );
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(
        language === 'odia' 
          ? 'ଶ୍ରେଣୀ ପରିବର୍ତ୍ତନ କରିବାରେ ତ୍ରୁଟି ହୋଇଛି'
          : 'Failed to change class'
      );
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          {language === 'odia' ? 'ଶ୍ରେଣୀ ଚୟନ' : 'Class Selection'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {language === 'odia' ? 'ବର୍ତ୍ତମାନ ଶ୍ରେଣୀ:' : 'Current Class:'}
            </p>
            <Badge variant="secondary" className="mt-1">
              {language === 'odia' ? `${profile?.class}ମ ଶ୍ରେଣୀ` : `Class ${profile?.class}`}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'odia' ? 'ନୂତନ ଶ୍ରେଣୀ ବାଛନ୍ତୁ:' : 'Select New Class:'}
          </label>
          <Select 
            onValueChange={handleClassChange}
            disabled={isChanging}
            value={profile?.class?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                language === 'odia' ? 'ଶ୍ରେଣୀ ବାଛନ୍ତୁ' : 'Select Class'
              } />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value.toString()}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {language === 'odia' 
                ? 'ଟିପ୍ପଣୀ: ଶ୍ରେଣୀ ପରିବର୍ତ୍ତନ କଲେ ଆପଣଙ୍କର ଅଗ୍ରଗତି ସାଇତା ହେବ ଏବଂ ନୂତନ ଶ୍ରେଣୀ ପାଇଁ ଉପଯୁକ୍ତ ବିଷୟବସ୍ତୁ ଦିଖାଯିବ।'
                : 'Note: Changing your class will save your progress and show content appropriate for the new grade level.'
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};