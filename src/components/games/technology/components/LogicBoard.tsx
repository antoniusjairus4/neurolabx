import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleLeft, ToggleRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogicBoardProps {
  language: 'english' | 'odia';
  switchA: boolean;
  switchB: boolean;
  selectedGate: 'AND' | 'OR' | 'NOT' | null;
  bulbLit: boolean;
  onSwitchToggle: (switchName: 'A' | 'B') => void;
}

export const LogicBoard: React.FC<LogicBoardProps> = ({
  language,
  switchA,
  switchB,
  selectedGate,
  bulbLit,
  onSwitchToggle,
}) => {
  const getGateSymbol = (gate: 'AND' | 'OR' | 'NOT' | null) => {
    switch (gate) {
      case 'AND': return '&';
      case 'OR': return '≥1';
      case 'NOT': return '¬';
      default: return '?';
    }
  };

  const getGateName = (gate: 'AND' | 'OR' | 'NOT' | null) => {
    if (!gate) return language === 'odia' ? 'ଗେଟ ବାଛନ୍ତୁ' : 'Select Gate';
    return gate;
  };

  return (
    <div className="h-full flex flex-col justify-center items-center relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6">
      {/* Circuit visualization */}
      <div className="grid grid-cols-5 gap-4 items-center w-full max-w-md">
        {/* Input switches column */}
        <div className="flex flex-col gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={switchA ? "default" : "outline"}
              size="sm"
              onClick={() => onSwitchToggle('A')}
              className={`w-full gap-2 ${switchA ? 'bg-technology text-technology-foreground' : ''}`}
            >
              {switchA ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              A
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={switchB ? "default" : "outline"}
              size="sm"
              onClick={() => onSwitchToggle('B')}
              className={`w-full gap-2 ${switchB ? 'bg-technology text-technology-foreground' : ''}`}
            >
              {switchB ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              B
            </Button>
          </motion.div>
        </div>

        {/* Connection lines */}
        <div className="flex flex-col justify-center items-center">
          <div className={`h-px w-8 ${switchA ? 'bg-technology' : 'bg-muted'} transition-colors`} />
          <div className="h-8" />
          <div className={`h-px w-8 ${switchB ? 'bg-technology' : 'bg-muted'} transition-colors`} />
        </div>

        {/* Logic gate */}
        <div className="flex justify-center">
          <Card className={`w-16 h-16 flex items-center justify-center ${selectedGate ? 'border-technology bg-technology/10' : 'border-dashed'}`}>
            <CardContent className="p-0 text-center">
              <div className="text-xs font-mono text-technology font-bold">
                {getGateSymbol(selectedGate)}
              </div>
              <div className="text-xs text-muted-foreground">
                {getGateName(selectedGate)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output connection */}
        <div className="flex justify-center items-center">
          <div className={`h-px w-8 ${bulbLit ? 'bg-technology' : 'bg-muted'} transition-colors`} />
        </div>

        {/* Output bulb */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: bulbLit ? [1, 1.1, 1] : 1,
              filter: bulbLit ? ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] : 'brightness(0.7)',
            }}
            transition={{
              duration: bulbLit ? 0.6 : 0.3,
              repeat: bulbLit ? Infinity : 0,
              repeatType: "reverse"
            }}
            className={`p-3 rounded-full ${bulbLit ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'} transition-colors`}
          >
            <Lightbulb className="h-8 w-8" />
          </motion.div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-6 text-center">
        <div className={`text-sm font-semibold ${bulbLit ? 'text-technology' : 'text-muted-foreground'}`}>
          {bulbLit 
            ? (language === 'odia' ? '🎉 ବଲ୍ବ ଜଳୁଛି!' : '🎉 Bulb is ON!')
            : (language === 'odia' ? 'ବଲ୍ବ ଜଳୁନାହିଁ' : 'Bulb is OFF')
          }
        </div>
        {selectedGate && (
          <div className="text-xs text-muted-foreground mt-1">
            {language === 'odia' ? `ଗେଟ: ${selectedGate}` : `Gate: ${selectedGate}`} | 
            A: {switchA ? 'ON' : 'OFF'} | 
            B: {switchB ? 'ON' : 'OFF'}
          </div>
        )}
      </div>
    </div>
  );
};