import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { LogicGateSimulatorClass6 } from './technology/LogicGateSimulatorClass6';

export const LogicGateSimulatorClass6Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUserStore();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <LogicGateSimulatorClass6 
      onBack={handleBack} 
      language={language === 'odia' ? 'odia' : 'english'}
    />
  );
};