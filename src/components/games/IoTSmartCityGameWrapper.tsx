import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { IoTSmartCityGame } from './technology/IoTSmartCityGame';

export const IoTSmartCityGameWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUserStore();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <IoTSmartCityGame 
      onBack={handleBack} 
      language={language === 'odia' ? 'odia' : 'english'}
    />
  );
};