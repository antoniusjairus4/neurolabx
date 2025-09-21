import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GameHeader } from '../components/GameHeader';
import { CompletionModal } from '../components/CompletionModal';
import { ScientificFactPopup } from '../components/ScientificFactPopup';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, MapPin, Zap, Wifi } from 'lucide-react';

interface SensorType {
  name: string;
  icon: string;
  defaultSettings: {
    frequency: string;
    latency: string;
    bandwidth: string;
  };
}

interface PlacedSensor {
  id: string;
  type: SensorType;
  zone: string;
  deviceId: string;
  frequency: string;
  latency: string;
  bandwidth: string;
}

interface IoTSmartCityGameProps {
  onBack: () => void;
  language: 'english' | 'odia';
}

const sensorTypes: SensorType[] = [
  {
    name: 'Temperature Sensor',
    icon: '🌡️',
    defaultSettings: {
      frequency: '5s',
      latency: 'low',
      bandwidth: 'medium'
    }
  },
  {
    name: 'Air Quality Sensor',
    icon: '🌫️',
    defaultSettings: {
      frequency: '10s',
      latency: 'medium',
      bandwidth: 'high'
    }
  },
  {
    name: 'Traffic Flow Sensor',
    icon: '🚦',
    defaultSettings: {
      frequency: '1s',
      latency: 'low',
      bandwidth: 'high'
    }
  },
  {
    name: 'Water Level Sensor',
    icon: '💧',
    defaultSettings: {
      frequency: '30s',
      latency: 'medium',
      bandwidth: 'low'
    }
  }
];

const dropZones = ['Downtown', 'Residential Area', 'Industrial Zone', 'Highway', 'River Bank'];

const optimizationGoals: Record<string, { 
  idealZone: string; 
  idealLatency?: string; 
  idealBandwidth?: string; 
  idealFrequency?: string; 
}> = {
  'Traffic Flow Sensor': { idealZone: 'Highway', idealLatency: 'low' },
  'Air Quality Sensor': { idealZone: 'Industrial Zone', idealBandwidth: 'high' },
  'Temperature Sensor': { idealZone: 'Residential Area', idealFrequency: '5s' },
  'Water Level Sensor': { idealZone: 'River Bank', idealLatency: 'medium' }
};

const SensorPalette: React.FC<{ sensorTypes: SensorType[]; language: 'english' | 'odia' }> = ({ sensorTypes, language }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        {language === 'odia' ? 'ସେନ୍ସର ପ୍ୟାଲେଟ୍' : 'IoT Sensors'}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {sensorTypes.map((sensor, index) => (
          <DraggableSensor key={index} sensor={sensor} language={language} />
        ))}
      </div>
    </div>
  );
};

const DraggableSensor: React.FC<{ sensor: SensorType; language: 'english' | 'odia' }> = ({ sensor, language }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'sensor',
    item: sensor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <motion.div
      ref={drag}
      className={`cursor-move p-3 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-200 hover:bg-primary/20 ${
        isDragging ? 'opacity-50' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-center">
        <div className="text-2xl mb-1">{sensor.icon}</div>
        <div className="text-xs font-medium text-primary">
          {sensor.name}
        </div>
      </div>
    </motion.div>
  );
};

const CityZone: React.FC<{ 
  zone: string; 
  placedSensors: PlacedSensor[];
  onSensorDrop: (sensor: SensorType, zone: string) => void;
  onSensorSelect: (sensor: PlacedSensor) => void;
  language: 'english' | 'odia';
}> = ({ zone, placedSensors, onSensorDrop, onSensorSelect, language }) => {
  const zoneSensors = placedSensors.filter(s => s.zone === zone);
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'sensor',
    drop: (item: SensorType) => onSensorDrop(item, zone),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'Downtown': return '🏢';
      case 'Residential Area': return '🏘️';
      case 'Industrial Zone': return '🏭';
      case 'Highway': return '🛣️';
      case 'River Bank': return '🏞️';
      default: return '📍';
    }
  };

  return (
    <motion.div
      ref={drop}
      className={`min-h-24 p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isOver && canDrop
          ? 'border-primary bg-primary/10'
          : canDrop
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-muted/50'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getZoneIcon(zone)}</span>
        <h4 className="font-medium text-sm">{zone}</h4>
      </div>
      
      <div className="space-y-2">
        {zoneSensors.map((sensor) => (
          <motion.div
            key={sensor.id}
            className="flex items-center justify-between p-2 bg-card border border-border rounded cursor-pointer hover:bg-muted/50"
            onClick={() => onSensorSelect(sensor)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <span>{sensor.type.icon}</span>
              <span className="text-xs">{sensor.deviceId}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {sensor.frequency}
            </Badge>
          </motion.div>
        ))}
        
        {zoneSensors.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            {language === 'odia' ? 'ସେନ୍ସର ଡ୍ରପ କରନ୍ତୁ' : 'Drop sensors here'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ConfigurationPanel: React.FC<{
  selectedSensor: PlacedSensor | null;
  onConfigUpdate: (sensorId: string, config: Partial<PlacedSensor>) => void;
  language: 'english' | 'odia';
}> = ({ selectedSensor, onConfigUpdate, language }) => {
  if (!selectedSensor) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            {language === 'odia' ? 'ସେନ୍ସର ସିଲେକ୍ଟ କରନ୍ତୁ' : 'Select a sensor to configure'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{selectedSensor.type.icon}</span>
          <h3 className="font-semibold">{selectedSensor.type.name}</h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              value={selectedSensor.deviceId}
              onChange={(e) => onConfigUpdate(selectedSensor.id, { deviceId: e.target.value })}
              placeholder="Enter unique device ID"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Data Frequency</Label>
            <Select
              value={selectedSensor.frequency}
              onValueChange={(value) => onConfigUpdate(selectedSensor.id, { frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1s">1 second</SelectItem>
                <SelectItem value="5s">5 seconds</SelectItem>
                <SelectItem value="10s">10 seconds</SelectItem>
                <SelectItem value="30s">30 seconds</SelectItem>
                <SelectItem value="60s">60 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="latency">Latency</Label>
            <Select
              value={selectedSensor.latency}
              onValueChange={(value) => onConfigUpdate(selectedSensor.id, { latency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bandwidth">Bandwidth</Label>
            <Select
              value={selectedSensor.bandwidth}
              onValueChange={(value) => onConfigUpdate(selectedSensor.id, { bandwidth: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const IoTSmartCityGame: React.FC<IoTSmartCityGameProps> = ({ onBack, language }) => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [placedSensors, setPlacedSensors] = useState<PlacedSensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<PlacedSensor | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFactPopup, setShowFactPopup] = useState(false);

  const handleSensorDrop = useCallback((sensor: SensorType, zone: string) => {
    const deviceId = `${sensor.name.split(' ')[0]}-${Date.now()}`;
    const newSensor: PlacedSensor = {
      id: `${zone}-${Date.now()}`,
      type: sensor,
      zone,
      deviceId,
      frequency: sensor.defaultSettings.frequency,
      latency: sensor.defaultSettings.latency,
      bandwidth: sensor.defaultSettings.bandwidth,
    };

    setPlacedSensors(prev => [...prev, newSensor]);
    toast.success(`${sensor.name} placed in ${zone}`);
  }, []);

  const handleConfigUpdate = useCallback((sensorId: string, config: Partial<PlacedSensor>) => {
    setPlacedSensors(prev =>
      prev.map(sensor =>
        sensor.id === sensorId ? { ...sensor, ...config } : sensor
      )
    );
    
    if (selectedSensor?.id === sensorId) {
      setSelectedSensor(prev => prev ? { ...prev, ...config } : null);
    }
  }, [selectedSensor]);

  const checkOptimization = useCallback(async () => {
    let correctPlacements = 0;
    const totalRequiredSensors = Object.keys(optimizationGoals).length;

    for (const [sensorName, goals] of Object.entries(optimizationGoals)) {
      const sensor = placedSensors.find(s => s.type.name === sensorName);
      
      if (!sensor) continue;

      const isZoneCorrect = sensor.zone === goals.idealZone;
      const isLatencyCorrect = !goals.idealLatency || sensor.latency === goals.idealLatency;
      const isBandwidthCorrect = !goals.idealBandwidth || sensor.bandwidth === goals.idealBandwidth;
      const isFrequencyCorrect = !goals.idealFrequency || sensor.frequency === goals.idealFrequency;

      if (isZoneCorrect && isLatencyCorrect && isBandwidthCorrect && isFrequencyCorrect) {
        correctPlacements++;
      }
    }

    if (correctPlacements === totalRequiredSensors) {
      const earnedXp = 100;
      setXp(prev => prev + earnedXp);

      if (user) {
        try {
          // Update user progress using direct field addition
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

          // Record module completion
          const { error: completionError } = await supabase
            .from('module_completion')
            .upsert({
              user_id: user.id,
              module_id: 'iot-smart-city-grade-12',
              completion_status: 'completed',
              xp_earned: earnedXp,
              attempts: 1,
              best_score: 100
            });

          if (completionError) throw completionError;

          // Add badge
          const { error: badgeError } = await supabase
            .from('badges')
            .insert({
              user_id: user.id,
              badge_name: 'IoT Architect',
              module_name: 'IoT Smart City Simulator'
            });

          if (badgeError && !badgeError.message.includes('duplicate')) {
            throw badgeError;
          }

        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }

      setShowCompletion(true);
      toast.success(language === 'odia' 
        ? 'ବଧାଇ! ତୁମର ସ୍ମାର୍ଟ ସିଟି ସଫଳତାର ସହିତ ଅପ୍ଟିମାଇଜ୍ ହୋଇଛି!'
        : 'Congratulations! Your smart city is successfully optimized!'
      );
    } else {
      toast.error(language === 'odia'
        ? 'ସେନ୍ସର ପ୍ଲେସମେଣ୍ଟ କିମ୍ବା ସେଟିଂସ୍ ଯାଞ୍ଚ କରନ୍ତୁ'
        : 'Check sensor placements and settings'
      );
    }
  }, [placedSensors, user, language]);

  const handlePlayAgain = () => {
    setPlacedSensors([]);
    setSelectedSensor(null);
    setShowCompletion(false);
    setXp(0);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <GameHeader
        title={language === 'odia' ? 'IoT ସ୍ମାର୍ଟ ସିଟି ସିମୁଲେଟର' : 'IoT Smart City Simulator'}
        xp={xp}
        onBack={onBack}
        language={language}
        subject="Technology"
      />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sensor Palette */}
          <div className="lg:col-span-1">
            <SensorPalette sensorTypes={sensorTypes} language={language} />
            
            <div className="mt-4">
              <Button
                onClick={checkOptimization}
                className="w-full"
                disabled={placedSensors.length === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                {language === 'odia' ? 'ନେଟୱର୍କ ଯାଞ୍ଚ କରନ୍ତୁ' : 'Check Network'}
              </Button>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowFactPopup(true)}
                className="w-full"
              >
                <Wifi className="h-4 w-4 mr-2" />
                {language === 'odia' ? 'IoT ତଥ୍ୟ' : 'IoT Facts'}
              </Button>
            </div>
          </div>

          {/* City Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {language === 'odia' ? 'ସ୍ମାର୍ଟ ସିଟି ମ୍ୟାପ' : 'Smart City Map'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {dropZones.map((zone) => (
                    <CityZone
                      key={zone}
                      zone={zone}
                      placedSensors={placedSensors}
                      onSensorDrop={handleSensorDrop}
                      onSensorSelect={setSelectedSensor}
                      language={language}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <ConfigurationPanel
              selectedSensor={selectedSensor}
              onConfigUpdate={handleConfigUpdate}
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
        badgeName="IoT Architect"
        gameName="IoT Smart City Simulator"
        language={language}
      />

      <ScientificFactPopup
        isOpen={showFactPopup}
        onClose={() => setShowFactPopup(false)}
        fact={{
          title: language === 'odia' ? 'IoT ସ୍ମାର୍ଟ ସିଟି' : 'IoT Smart City',
          titleOdia: 'IoT ସ୍ମାର୍ଟ ସିଟି',
          description: language === 'odia'
            ? 'IoT ଡିଭାଇସଗୁଡ଼ିକ ଇଣ୍ଟରନେଟ ମାଧ୍ୟମରେ ଯୋଗାଯୋଗ କରି ସ୍ମାର୍ଟ ସିଟି ନେଟୱର୍କ ସୃଷ୍ଟି କରନ୍ତି। ସେନ୍ସରଗୁଡ଼ିକ ଟ୍ରାଫିକ, ପ୍ରଦୂଷଣ ଓ ତାପମାତ୍ରା ମନିଟର କରି ନଗର ପରିଚାଳନାକୁ ଉନ୍ନତ କରନ୍ତି।'
            : 'IoT devices communicate through internet to create smart city networks. Sensors monitor traffic, pollution, and temperature to improve urban management and efficiency.',
          descriptionOdia: 'IoT ଡିଭାଇସଗୁଡ଼ିକ ଇଣ୍ଟରନେଟ ମାଧ୍ୟମରେ ଯୋଗାଯୋଗ କରି ସ୍ମାର୍ଟ ସିଟି ନେଟୱର୍କ ସୃଷ୍ଟି କରନ୍ତି। ସେନ୍ସରଗୁଡ଼ିକ ଟ୍ରାଫିକ, ପ୍ରଦୂଷଣ ଓ ତାପମାତ୍ରା ମନିଟର କରି ନଗର ପରିଚାଳନାକୁ ଉନ୍ନତ କରନ୍ତି।',
          type: 'technology'
        }}
        language={language}
      />
      </div>
    </DndProvider>
  );
};