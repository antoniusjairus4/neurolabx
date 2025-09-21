import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, BookOpen, Trophy } from 'lucide-react';

interface ComingSoonCardProps {
  language: 'english' | 'odia';
  currentClass: number;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ language, currentClass }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full"
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-primary/30" />
          </motion.div>
        </div>
        
        <CardHeader className="text-center pb-6 relative z-10">
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              {language === 'odia' ? `କ୍ଲାସ ${currentClass}` : `Class ${currentClass}`}
            </Badge>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            {language === 'odia' ? 'ଶୀଘ୍ର ଆସୁଛି!' : 'Coming Soon!'}
          </CardTitle>
          
          <p className="text-lg text-muted-foreground mt-2">
            {language === 'odia' 
              ? 'ଆପଣଙ୍କର ଶ୍ରେଣୀ ପାଇଁ ରୋମାଞ୍ଚକର ବିଷୟବସ୍ତୁ ପ୍ରସ୍ତୁତ କରାଯାଉଛି'
              : 'Exciting content is being prepared for your grade level'}
          </p>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-sm">
                  {language === 'odia' ? 'ଇଣ୍ଟରାକ୍ଟିଭ ଲେସନ୍' : 'Interactive Lessons'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === 'odia' ? 'ହାତେକରମେ ଶିଖିବା' : 'Hands-on learning'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-secondary/20">
              <BookOpen className="h-5 w-5 text-secondary-foreground" />
              <div>
                <h4 className="font-semibold text-sm">
                  {language === 'odia' ? 'ଆଡାପ୍ଟିଭ କଣ୍ଟେଣ୍ଟ' : 'Adaptive Content'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === 'odia' ? 'ବ୍ୟକ୍ତିଗତ ଅନୁଭବ' : 'Personalized experience'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-accent/20">
              <Trophy className="h-5 w-5 text-accent-foreground" />
              <div>
                <h4 className="font-semibold text-sm">
                  {language === 'odia' ? 'ଉପଲବ୍ଧି ବ୍ୟାଜ୍' : 'Achievement Badges'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === 'odia' ? 'ଅଗ୍ରଗତି ଟ୍ରାକିଂ' : 'Progress tracking'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-muted/30 border border-muted">
            <p className="text-sm text-muted-foreground">
              {language === 'odia' 
                ? 'ଏହି ମଧ୍ୟରେ, ୧୨ମ ଶ୍ରେଣୀରେ ଉନ୍ନତ ବିଷୟବସ୍ତୁ ଅନ୍ବେଷଣ କରନ୍ତୁ!'
                : 'Meanwhile, explore advanced content in Class 12!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};