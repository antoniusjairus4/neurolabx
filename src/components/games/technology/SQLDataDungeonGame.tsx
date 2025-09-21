import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { ScientificFactPopup } from '../components/ScientificFactPopup';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, Code, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  visual: string;
  task: string;
  completed: boolean;
  puzzle: {
    table: string;
    columns: string[];
    data?: any[];
    queryType: string;
    goal: string;
    expectedResult: any;
    badge: string;
    xpReward: number;
  };
}

interface SQLDataDungeonGameProps {
  onBack: () => void;
  language: 'english' | 'odia';
}

const zones: Zone[] = [
  {
    id: 'library',
    name: 'The Lost Library',
    visual: 'floating bookshelves and broken tables',
    task: 'Use SELECT to find missing author names',
    completed: false,
    puzzle: {
      table: 'Books',
      columns: ['id', 'title', 'author'],
      data: [
        { id: 1, title: 'The Odyssey', author: null },
        { id: 2, title: 'The Republic', author: 'Plato' }
      ],
      queryType: 'SELECT',
      goal: 'SELECT * FROM Books WHERE author IS NULL;',
      expectedResult: [{ id: 1, title: 'The Odyssey', author: null }],
      badge: 'Data Detective',
      xpReward: 20
    }
  },
  {
    id: 'market',
    name: 'The Market of Glitches',
    visual: 'glitched shop stalls with flickering signs',
    task: 'Use INSERT to restore missing shop data',
    completed: false,
    puzzle: {
      table: 'Shops',
      columns: ['id', 'name', 'owner'],
      queryType: 'INSERT',
      goal: "INSERT INTO Shops (id, name, owner) VALUES (3, 'Potion House', 'Zara');",
      expectedResult: 'Row inserted successfully',
      badge: 'Insert Wizard',
      xpReward: 20
    }
  },
  {
    id: 'prison',
    name: 'The Prison of Deleted Rows',
    visual: 'a dark hallway with locked cells containing records',
    task: 'Use DELETE to remove corrupted entries',
    completed: false,
    puzzle: {
      table: 'Users',
      columns: ['id', 'username', 'status'],
      data: [
        { id: 1, username: 'admin', status: 'active' },
        { id: 2, username: 'evil_bot', status: 'banned' }
      ],
      queryType: 'DELETE',
      goal: "DELETE FROM Users WHERE status = 'banned';",
      expectedResult: '1 row deleted',
      badge: 'Data Slayer',
      xpReward: 20
    }
  },
  {
    id: 'core',
    name: 'The Core of Corruption',
    visual: 'glowing data core surrounded by bugs',
    task: 'Use UPDATE to fix incorrect records',
    completed: false,
    puzzle: {
      table: 'Students',
      columns: ['id', 'name', 'grade'],
      data: [
        { id: 1, name: 'Jairus', grade: 'F' }
      ],
      queryType: 'UPDATE',
      goal: "UPDATE Students SET grade = 'A' WHERE name = 'Jairus';",
      expectedResult: '1 row updated',
      badge: 'Query Conqueror',
      xpReward: 40
    }
  }
];

const ZoneCard: React.FC<{
  zone: Zone;
  isActive: boolean;
  onClick: () => void;
  language: 'english' | 'odia';
}> = ({ zone, isActive, onClick, language }) => {
  const getZoneIcon = (zoneId: string) => {
    switch (zoneId) {
      case 'library': return '📚';
      case 'market': return '🏪';
      case 'prison': return '🔒';
      case 'core': return '💎';
      default: return '📍';
    }
  };

  return (
    <motion.div
      className={`cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`h-full ${isActive ? 'ring-2 ring-primary' : ''} ${zone.completed ? 'bg-success/10 border-success' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getZoneIcon(zone.id)}</div>
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                {zone.name}
                {zone.completed && <CheckCircle className="h-4 w-4 text-success" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{zone.visual}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-2">{zone.task}</p>
          <Badge variant={zone.completed ? "default" : "secondary"} className="text-xs">
            {zone.puzzle.queryType}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QueryEditor: React.FC<{
  zone: Zone | null;
  onQuerySubmit: (query: string) => void;
  language: 'english' | 'odia';
}> = ({ zone, onQuerySubmit, language }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onQuerySubmit(query.trim());
    }
  };

  if (!zone) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'odia' ? 'ଏକ ଜୋନ୍ ସିଲେକ୍ଟ କରନ୍ତୁ' : 'Select a zone to start'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          {language === 'odia' ? 'SQL ଏଡିଟର' : 'SQL Editor'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">{zone.name}</h4>
          <p className="text-sm text-muted-foreground mb-4">{zone.task}</p>
          
          {zone.puzzle.data && (
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-2">
                {language === 'odia' ? 'ଟେବଲ୍ ଡାଟା' : 'Table Data'}: {zone.puzzle.table}
              </h5>
              <div className="bg-muted p-3 rounded text-xs font-mono">
                <div className="grid grid-cols-3 gap-2 border-b pb-1 mb-2 font-semibold">
                  {zone.puzzle.columns.map(col => (
                    <div key={col}>{col}</div>
                  ))}
                </div>
                {zone.puzzle.data.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 py-1">
                    {zone.puzzle.columns.map(col => (
                      <div key={col}>{row[col] === null ? 'NULL' : row[col]}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'odia' ? 'ତୁମର SQL କ୍ୱେରୀ ଲେଖ' : 'Write your SQL query'}:
          </label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${zone.puzzle.queryType} ...`}
            className="font-mono text-sm min-h-20"
          />
        </div>

        <Button onClick={handleSubmit} disabled={!query.trim()} className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          {language === 'odia' ? 'କ୍ୱେରୀ ଚଲାନ୍ତୁ' : 'Execute Query'}
        </Button>
      </CardContent>
    </Card>
  );
};

export const SQLDataDungeonGame: React.FC<SQLDataDungeonGameProps> = ({ onBack, language }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [gameZones, setGameZones] = useState(zones);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFactPopup, setShowFactPopup] = useState(false);

  const checkQueryCorrectness = (userQuery: string, expectedQuery: string): boolean => {
    const normalize = (query: string) => 
      query.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/;+$/, '')
        .trim();
    
    return normalize(userQuery) === normalize(expectedQuery);
  };

  const handleQuerySubmit = useCallback(async (query: string) => {
    if (!activeZone) return;

    const isCorrect = checkQueryCorrectness(query, activeZone.puzzle.goal);
    
    if (isCorrect) {
      const earnedXp = activeZone.puzzle.xpReward;
      setXp(prev => prev + earnedXp);

      // Mark zone as completed
      setGameZones(prev => 
        prev.map(zone => 
          zone.id === activeZone.id 
            ? { ...zone, completed: true }
            : zone
        )
      );

      if (user) {
        try {
          // Update user progress
          const { data: currentProgress } = await supabase
            .from('user_progress')
            .select('total_xp')
            .eq('user_id', user.id)
            .single();

          if (currentProgress) {
            const { error: progressError } = await supabase
              .from('user_progress')
              .update({ total_xp: currentProgress.total_xp + earnedXp })
              .eq('user_id', user.id);

            if (progressError) throw progressError;
          }

          // Add badge
          const { error: badgeError } = await supabase
            .from('badges')
            .insert({
              user_id: user.id,
              badge_name: activeZone.puzzle.badge,
              module_name: 'SQL Data Dungeon'
            });

          if (badgeError && !badgeError.message.includes('duplicate')) {
            throw badgeError;
          }

        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }

      toast.success(language === 'odia' 
        ? `ବଧାଇ! ${activeZone.puzzle.badge} ବ୍ୟାଜ ଅର୍ଜନ କରିଛନ୍ତି!`
        : `Success! Earned ${activeZone.puzzle.badge} badge!`
      );

      // Check if all zones completed
      const updatedZones = gameZones.map(zone => 
        zone.id === activeZone.id ? { ...zone, completed: true } : zone
      );
      
      if (updatedZones.every(zone => zone.completed)) {
        setTimeout(() => {
          if (user) {
            // Record module completion
            supabase
              .from('module_completion')
              .upsert({
                user_id: user.id,
                module_id: 'sql-data-dungeon-grade-12',
                completion_status: 'completed',
                xp_earned: 100,
                attempts: 1,
                best_score: 100
              });
          }
          setShowCompletion(true);
        }, 1000);
      }
    } else {
      toast.error(language === 'odia'
        ? 'କ୍ୱେରୀ ସଠିକ୍ ନୁହେଁ। SQL ସିଣ୍ଟାକ୍ସ ଯାଞ୍ଚ କରନ୍ତୁ।'
        : 'Query incorrect. Review SQL syntax and try again.'
      );
    }
  }, [activeZone, gameZones, user, language]);

  const handlePlayAgain = () => {
    setGameZones(zones);
    setActiveZone(null);
    setShowCompletion(false);
    setXp(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <GameHeader
        title={language === 'odia' ? 'SQL ডিমিউলेटর: ডাটা ডাঞ্জন' : 'SQL Simulator: Data Dungeon'}
        xp={xp}
        onBack={onBack}
        language={language}
        subject="Technology"
      />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zones Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                {language === 'odia' ? 'ডাঞ্জন জোনস' : 'Dungeon Zones'}
              </h3>
            </div>
            
            {gameZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isActive={activeZone?.id === zone.id}
                onClick={() => setActiveZone(zone)}
                language={language}
              />
            ))}

            <Button
              variant="outline"
              onClick={() => setShowFactPopup(true)}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {language === 'odia' ? 'SQL তথ্য' : 'SQL Facts'}
            </Button>
          </div>

          {/* Query Editor */}
          <div className="lg:col-span-2">
            <QueryEditor
              zone={activeZone}
              onQuerySubmit={handleQuerySubmit}
              language={language}
            />
          </div>
        </div>
      </div>

      <CompletionModal
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        onPlayAgain={handlePlayAgain}
        onReturnHome={onBack}
        xpEarned={100}
        badgeName="Query Conqueror"
        gameName="SQL Data Dungeon"
        language={language}
      />

      <ScientificFactPopup
        isOpen={showFactPopup}
        onClose={() => setShowFactPopup(false)}
        fact={{
          title: language === 'odia' ? 'SQL ডাটাবেস' : 'SQL Database',
          titleOdia: 'SQL ডাটাবেস',
          description: language === 'odia'
            ? 'SQL (Structured Query Language) হল ডাটাবেস পরিচালনার জন্য একটি শক্তিশালী ভাষা। এটি ডাটা সংগ্রহ, সংশোধন এবং পরিচালনা করতে ব্যবহৃত হয়।'
            : 'SQL (Structured Query Language) is a powerful language for managing databases. It is used to store, retrieve, update, and manipulate data efficiently.',
          descriptionOdia: 'SQL (Structured Query Language) হল ডাটাবেস পরিচালনার জন্য একটি শক্তিশালী ভাষা। এটি ডাটা সংগ্রহ, সংশোধন এবং পরিচালনা করতে ব্যবহৃত হয়।',
          type: 'technology'
        }}
        language={language}
      />
    </div>
  );
};