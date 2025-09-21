import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface MathElement {
  id: string;
  type: 'triangle' | 'rectangle' | 'square';
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  used: boolean;
}

interface MathDraggableElementProps {
  element: MathElement;
  language: 'english' | 'odia';
  disabled: boolean;
}

export const MathDraggableElement: React.FC<MathDraggableElementProps> = ({
  element,
  language,
  disabled
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'math-element',
    item: { id: element.id, type: element.type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getElementColor = (type: string) => {
    switch (type) {
      case 'triangle': return 'text-red-600 dark:text-red-400';
      case 'rectangle': return 'text-blue-600 dark:text-blue-400';
      case 'square': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getElementBg = (type: string) => {
    switch (type) {
      case 'triangle': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'rectangle': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'square': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <motion.div
      ref={drag}
      animate={{
        opacity: isDragging ? 0.5 : disabled ? 0.6 : 1,
        scale: isDragging ? 1.1 : 1,
      }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      className={`cursor-${disabled ? 'not-allowed' : 'grab'} ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <Card className={`transition-all duration-200 ${getElementBg(element.type)} ${
        disabled ? 'opacity-60' : 'hover:shadow-md'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getElementColor(element.type)}`}>
              <element.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                {language === 'odia' ? element.nameOdia : element.name}
              </h4>
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