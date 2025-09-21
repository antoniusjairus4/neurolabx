import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';

interface DropZoneProps {
  type: 'water' | 'sunlight' | 'co2';
  position: 'bottom-left' | 'top-center' | 'middle-right';
  onDrop: () => void;
  active: boolean;
  label: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  type,
  position,
  onDrop,
  active,
  label,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'game-element',
    drop: (item: { type: string }) => {
      if (item.type === type && active) {
        onDrop();
      }
    },
    canDrop: (item: { type: string }) => item.type === type && active,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'absolute bottom-4 left-4';
      case 'top-center':
        return 'absolute top-4 left-1/2 transform -translate-x-1/2';
      case 'middle-right':
        return 'absolute top-1/2 right-4 transform -translate-y-1/2';
      default:
        return '';
    }
  };

  const getDropZoneColor = () => {
    if (!active) return 'bg-gray-200/50 border-gray-300';
    if (isOver && canDrop) return 'bg-science/20 border-science scale-110';
    if (canDrop) return 'bg-science/10 border-science/50';
    return 'bg-muted/50 border-muted-foreground/20';
  };

  if (!active) return null;

  return (
    <motion.div
      ref={drop}
      className={`${getPositionClasses()} w-16 h-16 rounded-full border-2 border-dashed ${getDropZoneColor()} 
                 flex items-center justify-center transition-all duration-200`}
      animate={{
        scale: isOver && canDrop ? 1.1 : 1,
      }}
    >
      <motion.div
        className="text-xs text-center font-medium text-muted-foreground"
        animate={{
          opacity: isOver && canDrop ? 0 : 1,
        }}
      >
        {label}
      </motion.div>
      
      {isOver && canDrop && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-science/30 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-science rounded-full animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
};