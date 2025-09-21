import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { TechnologyGameSelector } from './technology/TechnologyGameSelector';

export const TechnologyGameSelectorWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUserStore();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <TechnologyGameSelector 
      onBack={handleBack} 
      language={language === 'odia' ? 'odia' : 'english'}
    />
  );
};