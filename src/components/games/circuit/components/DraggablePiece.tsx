import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export type CircuitPieceType = 'battery' | 'switch' | 'bulb' | 'wires';

interface CircuitPiece {
  id: string;
  type: CircuitPieceType;
  name: string;
  nameOdia: string;
  icon: React.ComponentType<{ className?: string }>;
  used: boolean;
}

interface DraggablePieceProps {
  piece: CircuitPiece;
  language: 'english' | 'odia';
  disabled?: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, language, disabled }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'circuit-piece',
    item: { type: piece.type },
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <motion.div
      ref={drag}
      animate={{ opacity: disabled ? 0.5 : 1, scale: isDragging ? 0.95 : 1 }}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      className={`cursor-${disabled ? 'not-allowed' : 'grab'}`}
    >
      <Card className={`transition-all ${disabled ? 'grayscale' : ''}`}>
        <CardContent className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full bg-background border`}
            >
              <piece.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {language === 'odia' ? piece.nameOdia : piece.name}
              </p>
              {disabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'odia' ? 'ବ୍ୟବହୃତ' : 'Placed'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};