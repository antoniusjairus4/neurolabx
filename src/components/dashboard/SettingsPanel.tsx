import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Globe, GraduationCap } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { ClassSwitcher } from './ClassSwitcher';

interface SettingsPanelProps {
  language: 'english' | 'odia';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ language }) => {
  const { profile, setLanguage } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'english' | 'odia');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          {language === 'odia' ? 'ସେଟିଙ୍ଗ' : 'Settings'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'odia' ? 'ସେଟିଙ୍ଗ' : 'Settings'}
          </DialogTitle>
          <DialogDescription>
            {language === 'odia' 
              ? 'ଆପଣଙ୍କର ପସନ୍ଦ ଏବଂ ଶ୍ରେଣୀ ପରିଚାଳନା କରନ୍ତୁ'
              : 'Manage your preferences and class settings'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Language Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                {language === 'odia' ? 'ଭାଷା' : 'Language'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {language === 'odia' ? 'ବର୍ତ୍ତମାନ ଭାଷା:' : 'Current Language:'}
                </span>
                <Badge variant="secondary">
                  {language === 'odia' ? 'ଓଡ଼ିଆ' : 'English'}
                </Badge>
              </div>
              <Select onValueChange={handleLanguageChange} value={language}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="odia">ଓଡ଼ିଆ (Odia)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Class Switcher */}
          <ClassSwitcher language={language} />

          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {language === 'odia' ? 'ବ୍ୟବହାରକାରୀ ତଥ୍ୟ' : 'User Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'odia' ? 'ନାମ:' : 'Name:'}
                </span>
                <span>{profile?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'odia' ? 'ଶ୍ରେଣୀ:' : 'Class:'}
                </span>
                <span>
                  {language === 'odia' ? `${profile?.class}ମ ଶ୍ରେଣୀ` : `Class ${profile?.class}`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsOpen(false)} variant="outline">
            {language === 'odia' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};