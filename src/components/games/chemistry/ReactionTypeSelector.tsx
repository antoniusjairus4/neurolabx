import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Atom } from 'lucide-react';

interface ReactionTypeSelectorProps {
  types: string[];
  selectedType: string | null;
  onSelect: (type: string) => void;
  language: 'english' | 'odia';
}

export const ReactionTypeSelector: React.FC<ReactionTypeSelectorProps> = ({
  types,
  selectedType,
  onSelect,
  language,
}) => {
  const getReactionTypeColor = (type: string) => {
    switch (type) {
      case 'SN1':
      case 'SN2':
        return 'bg-science/10 text-science border-science/20 hover:bg-science/20';
      case 'Aldol Condensation':
        return 'bg-engineering/10 text-engineering border-engineering/20 hover:bg-engineering/20';
      case 'Elimination (E1)':
      case 'Elimination (E2)':
        return 'bg-technology/10 text-technology border-technology/20 hover:bg-technology/20';
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Atom className="h-4 w-4" />
          {language === 'odia' ? 'ପ୍ରତିକ୍ରିୟା ପ୍ରକାର' : 'Reaction Type'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => onSelect(type)}
              className={`justify-start text-left h-auto p-3 ${selectedType === type ? '' : getReactionTypeColor(type)}`}
              size="sm"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{type}</span>
                {selectedType === type && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="secondary" className="ml-2">
                      {language === 'odia' ? 'ନିର୍ବାচିତ' : 'Selected'}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20"
          >
            <p className="text-sm text-muted-foreground">
              {language === 'odia' ? 'ନିର্ବাচିত প্রতিক্রিয়া: ' : 'Selected Reaction: '}
              <span className="font-medium text-foreground">{selectedType}</span>
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};