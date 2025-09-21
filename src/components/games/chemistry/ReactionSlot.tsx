import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface ReactionSlotProps {
  type: 'reactant' | 'reagent';
  selectedComponent: string | null;
  onDrop: (componentName: string, slotType: 'reactant' | 'reagent') => void;
  language: 'english' | 'odia';
}

export const ReactionSlot: React.FC<ReactionSlotProps> = ({
  type,
  selectedComponent,
  onDrop,
  language,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'chemical-component',
    drop: (item: { name: string; type: 'reactant' | 'reagent' }) => {
      if (item.type === type) {
        onDrop(item.name, type);
      }
    },
    canDrop: (item: { name: string; type: 'reactant' | 'reagent' }) => item.type === type,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const getSlotColor = () => {
    if (selectedComponent) {
      return type === 'reactant' ? 'bg-science/20 border-science text-science' : 'bg-engineering/20 border-engineering text-engineering';
    }
    if (isOver && canDrop) {
      return 'bg-primary/20 border-primary border-dashed';
    }
    if (canDrop) {
      return 'bg-muted border-dashed border-muted-foreground/50';
    }
    return 'bg-muted/50 border-dashed border-muted-foreground/30';
  };

  const getSlotLabel = () => {
    if (type === 'reactant') {
      return language === 'odia' ? 'ବିକ୍ରିୟାକାରୀ ଛାଡନ୍ତୁ' : 'Drop Reactant Here';
    }
    return language === 'odia' ? 'ପରୀକ୍ଷକ ଛାଡନ୍ତୁ' : 'Drop Reagent Here';
  };

  return (
    <motion.div
      ref={drop}
      whileHover={{ scale: 1.02 }}
      animate={{ scale: isOver && canDrop ? 1.05 : 1 }}
      className="min-h-[80px]"
    >
      <Card className={`border-2 transition-all duration-200 ${getSlotColor()}`}>
        <CardContent className="p-4 text-center">
          {selectedComponent ? (
            <div className="space-y-2">
              <div className="text-lg font-medium">{selectedComponent}</div>
              <div className="text-xs opacity-70">
                {type === 'reactant' ? (language === 'odia' ? 'ବିକ୍ରିୟାକାରୀ' : 'Reactant') : (language === 'odia' ? 'ପରୀକ୍ଷକ' : 'Reagent')}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Plus className="h-6 w-6" />
              <span className="text-sm">{getSlotLabel()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};