import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';

interface MathDropZoneProps {
  type: 'triangle' | 'rectangle' | 'square';
  position: 'top' | 'center' | 'bottom';
  onDrop: (type: string) => void;
  active: boolean;
  label: string;
}

export const MathDropZone: React.FC<MathDropZoneProps> = ({
  type,
  position,
  onDrop,
  active,
  label
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'math-element',
    drop: (item: { id: string; type: string }) => {
      if (item.type === type && active) {
        onDrop(type);
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
      case 'top': return 'justify-self-center';
      case 'center': return 'justify-self-center';
      case 'bottom': return 'justify-self-center';
      default: return 'justify-self-center';
    }
  };

  const getDropZoneColor = () => {
    if (!active) return 'border-gray-300 bg-gray-50 text-gray-400';
    if (isOver && canDrop) return 'border-green-400 bg-green-50 text-green-600 shadow-lg';
    if (canDrop) return 'border-blue-300 bg-blue-50 text-blue-600';
    return 'border-gray-300 bg-gray-50 text-gray-400';
  };

  return (
    <motion.div
      ref={drop}
      className={`${getPositionClasses()} w-full`}
      whileHover={active ? { scale: 1.02 } : {}}
      animate={{ scale: isOver && canDrop ? 1.05 : 1 }}
    >
      <div
        className={`
          min-h-[80px] w-full rounded-xl border-2 border-dashed 
          flex items-center justify-center p-4 transition-all duration-300
          ${getDropZoneColor()}
        `}
      >
        <motion.div
          className="text-center"
          animate={isOver && canDrop ? { y: [0, -5, 0] } : {}}
          transition={{ repeat: isOver && canDrop ? Infinity : 0, duration: 0.6 }}
        >
          <p className="text-sm font-medium">
            {label}
          </p>
          {active && (
            <motion.div
              className="mt-2 w-8 h-1 bg-current rounded-full mx-auto opacity-60"
              animate={{ width: isOver && canDrop ? '2rem' : '1rem' }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};