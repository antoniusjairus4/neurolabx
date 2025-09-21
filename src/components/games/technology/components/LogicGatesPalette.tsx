import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LogicGatesPaletteProps {
  language: 'english' | 'odia';
  selectedGate: 'AND' | 'OR' | 'NOT' | null;
  onGateSelect: (gate: 'AND' | 'OR' | 'NOT') => void;
}

interface Gate {
  type: 'AND' | 'OR' | 'NOT';
  symbol: string;
  name: string;
  nameOdia: string;
  description: string;
  descriptionOdia: string;
  truthTable: string;
  truthTableOdia: string;
}

export const LogicGatesPalette: React.FC<LogicGatesPaletteProps> = ({
  language,
  selectedGate,
  onGateSelect,
}) => {
  const gates: Gate[] = [
    {
      type: 'AND',
      symbol: '&',
      name: 'AND Gate',
      nameOdia: 'AND ଗେଟ',
      description: 'Output is ON only when both inputs are ON',
      descriptionOdia: 'ଦୁଇଟି ଇନପୁଟ ON ଥିଲେ ଆଉଟପୁଟ ON ହୁଏ',
      truthTable: '1 & 1 = 1',
      truthTableOdia: '1 & 1 = 1',
    },
    {
      type: 'OR',
      symbol: '≥1',
      name: 'OR Gate',
      nameOdia: 'OR ଗେଟ',
      description: 'Output is ON when at least one input is ON',
      descriptionOdia: 'ଗୋଟିଏ ଇନପୁଟ ON ଥିଲେ ଆଉଟପୁଟ ON ହୁଏ',
      truthTable: '1 | 0 = 1',
      truthTableOdia: '1 | 0 = 1',
    },
    {
      type: 'NOT',
      symbol: '¬',
      name: 'NOT Gate',
      nameOdia: 'NOT ଗେଟ',
      description: 'Output is the opposite of input A',
      descriptionOdia: 'ଇନପୁଟ A ର ବିପରୀତ ଆଉଟପୁଟ ହୁଏ',
      truthTable: '¬1 = 0',
      truthTableOdia: '¬1 = 0',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-technology">
        {language === 'odia' ? 'ଲଜିକ ଗେଟସ' : 'Logic Gates'}
      </h3>
      
      {gates.map((gate) => (
        <motion.div
          key={gate.type}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedGate === gate.type 
                ? 'border-technology bg-technology/10 shadow-md' 
                : 'hover:border-technology/50 hover:bg-technology/5'
            }`}
            onClick={() => onGateSelect(gate.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl font-mono text-technology">
                    {gate.symbol}
                  </span>
                  <span className="text-technology">
                    {language === 'odia' ? gate.nameOdia : gate.name}
                  </span>
                </CardTitle>
                {selectedGate === gate.type && (
                  <div className="w-3 h-3 rounded-full bg-technology" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-3">
                {language === 'odia' ? gate.descriptionOdia : gate.description}
              </CardDescription>
              <div className="text-xs font-mono bg-muted p-2 rounded text-center">
                {language === 'odia' ? gate.truthTableOdia : gate.truthTable}
              </div>
              {selectedGate !== gate.type && (
                <Button
                  size="sm"
                  className="w-full mt-3 bg-technology hover:bg-technology/90 text-technology-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGateSelect(gate.type);
                  }}
                >
                  {language === 'odia' ? 'ବାଛନ୍ତୁ' : 'Select'}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};