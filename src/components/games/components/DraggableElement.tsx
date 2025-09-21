import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface GameElement {
  id: string;
  type: 'water' | 'sunlight' | 'co2';
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  used: boolean;
}

interface DraggableElementProps {
  element: GameElement;
  language: 'english' | 'odia';
  disabled: boolean;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  language,
  disabled,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'game-element',
    item: { type: element.type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getElementColor = (type: string) => {
    switch (type) {
      case 'water': return 'text-blue-500';
      case 'sunlight': return 'text-yellow-500';
      case 'co2': return 'text-gray-500';
      default: return 'text-primary';
    }
  };

  const getElementBg = (type: string) => {
    switch (type) {
      case 'water': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200';
      case 'sunlight': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200';
      case 'co2': return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200';
      default: return 'bg-muted';
    }
  };

  return (
    <motion.div
      ref={drag}
      animate={{
        opacity: disabled ? 0.4 : 1,
        scale: isDragging ? 0.9 : 1,
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      className={`cursor-${disabled ? 'not-allowed' : 'grab'} ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <Card className={`${getElementBg(element.type)} ${disabled ? 'grayscale' : ''} transition-all`}>
        <CardContent className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full bg-white/50 ${getElementColor(element.type)}`}>
              <element.icon className="h-6 w-6" />
            </div>
            
            <div>
              <p className="font-semibold text-sm">
                {language === 'odia' ? element.nameOdia : element.name}
              </p>
              {disabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'odia' ? 'ବ୍ୟବହୃତ' : 'Used'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};