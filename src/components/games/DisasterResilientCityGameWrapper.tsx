import React from 'react';
import { DisasterResilientCityGame } from './engineering/DisasterResilientCityGame';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';

export const DisasterResilientCityGameWrapper: React.FC = () => {
  const { language } = useUserStore();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <DisasterResilientCityGame 
      onBack={handleBack} 
      language={language as 'english' | 'odia'} 
    />
  );
};