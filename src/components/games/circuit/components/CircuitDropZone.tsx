import React from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import type { CircuitPieceType } from './DraggablePiece';

interface CircuitDropZoneProps {
  type: CircuitPieceType;
  label: string;
  active: boolean;
  onDrop: () => void;
  style?: React.CSSProperties;
}

export const CircuitDropZone: React.FC<CircuitDropZoneProps> = ({ type, label, active, onDrop, style }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'circuit-piece',
    drop: (item: { type: CircuitPieceType }) => {
      if (item.type === type && active) onDrop();
    },
    canDrop: (item: { type: CircuitPieceType }) => item.type === type && active,
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() })
  }));

  if (!active) return null;

  return (
    <motion.div
      ref={drop}
      style={style}
      className={`absolute rounded-md border-2 border-dashed flex items-center justify-center text-xs px-2 py-1 select-none ${
        isOver && canDrop ? 'bg-engineering/20 border-engineering scale-105' : 'bg-muted/50 border-muted-foreground/20'
      }`}
      animate={{ scale: isOver && canDrop ? 1.05 : 1 }}
    >
      {label}
    </motion.div>
  );
};