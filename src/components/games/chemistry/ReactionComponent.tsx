import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ChemicalComponent {
  id: string;
  name: string;
  nameOdia: string;
  type: 'reactant' | 'reagent';
  category: string;
  icon: string;
  used: boolean;
}

interface ReactionComponentProps {
  component: ChemicalComponent;
  language: 'english' | 'odia';
  onDrop: (componentName: string, slotType: 'reactant' | 'reagent') => void;
}

export const ReactionComponent: React.FC<ReactionComponentProps> = ({
  component,
  language,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'chemical-component',
    item: { name: component.name, type: component.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getComponentColor = (category: string) => {
    switch (category) {
      case 'alkyl halide':
        return 'bg-science/10 text-science border-science/20';
      case 'aldehyde':
        return 'bg-engineering/10 text-engineering border-engineering/20';
      case 'ketone':
        return 'bg-technology/10 text-technology border-technology/20';
      case 'alcohol':
        return 'bg-math/10 text-math border-math/20';
      case 'base':
        return 'bg-badge/10 text-badge border-badge/20';
      case 'acid':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'solvent':
        return 'bg-blue-100/10 text-blue-600 border-blue-200/20 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/20';
      case 'catalyst':
        return 'bg-orange-100/10 text-orange-600 border-orange-200/20 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 0.95 : 1 
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className={`transition-all duration-200 hover:shadow-md ${getComponentColor(component.category)}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{component.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {language === 'odia' ? component.nameOdia : component.name}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {component.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};