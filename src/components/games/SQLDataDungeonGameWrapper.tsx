import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { SQLDataDungeonGame } from './technology/SQLDataDungeonGame';

export const SQLDataDungeonGameWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useUserStore();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <SQLDataDungeonGame 
      onBack={handleBack} 
      language={language === 'odia' ? 'odia' : 'english'}
    />
  );
};