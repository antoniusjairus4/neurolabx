import React from 'react';
import { motion } from 'framer-motion';

interface CircuitBoardProps {
  batteryPlaced: boolean;
  switchPlaced: boolean;
  bulbPlaced: boolean;
  wiresPlaced: boolean;
  completed: boolean;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({ batteryPlaced, switchPlaced, bulbPlaced, wiresPlaced, completed }) => {
  return (
    <div className="relative h-96 w-full bg-gradient-to-b from-technology/5 to-engineering/5 rounded-lg border">
      {/* Board grid */}
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(100,100,100,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Wire path visual */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M60 240 H340 V60 H60 Z" fill="none" stroke="currentColor" className={`opacity-30 ${completed ? 'text-emerald-500' : 'text-muted-foreground'}`} strokeWidth="3" strokeDasharray="6 4" />
      </svg>

      {/* Bulb visual */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="w-12 h-12 rounded-full border bg-background"
          animate={{ boxShadow: completed ? '0 0 30px rgba(34,197,94,0.6)' : 'none', backgroundColor: completed ? 'rgba(34,197,94,0.15)' : 'transparent' }}
          transition={{ duration: 0.4 }}
        />
        <p className="text-xs text-muted-foreground mt-2">Bulb</p>
      </div>

      {/* Placed tags */}
      <div className="absolute bottom-2 left-2 flex gap-2 text-xs">
        <span className={`px-2 py-1 rounded border ${batteryPlaced ? 'bg-engineering/10 border-engineering' : 'bg-muted/50'}`}>Battery</span>
        <span className={`px-2 py-1 rounded border ${switchPlaced ? 'bg-engineering/10 border-engineering' : 'bg-muted/50'}`}>Switch</span>
        <span className={`px-2 py-1 rounded border ${bulbPlaced ? 'bg-engineering/10 border-engineering' : 'bg-muted/50'}`}>Bulb</span>
        <span className={`px-2 py-1 rounded border ${wiresPlaced ? 'bg-engineering/10 border-engineering' : 'bg-muted/50'}`}>Wires</span>
      </div>
    </div>
  );
};