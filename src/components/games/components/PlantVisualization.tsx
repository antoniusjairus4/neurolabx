import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlantVisualizationProps {
  growthStage: number;
  waterAdded: boolean;
  sunlightAdded: boolean;
  co2Added: boolean;
}

export const PlantVisualization: React.FC<PlantVisualizationProps> = ({
  growthStage,
  waterAdded,
  sunlightAdded,
  co2Added,
}) => {
  const [isPhotosynthesizing, setIsPhotosynthesizing] = useState(false);

  useEffect(() => {
    if (waterAdded && sunlightAdded && co2Added) {
      setIsPhotosynthesizing(true);
    }
  }, [waterAdded, sunlightAdded, co2Added]);

  const getStemColor = () => {
    if (isPhotosynthesizing) return 'bg-gradient-to-t from-emerald-600 to-emerald-400';
    if (growthStage >= 2) return 'bg-gradient-to-t from-green-600 to-green-500';
    return 'bg-gradient-to-t from-green-700 to-green-600';
  };

  return (
    <div className="relative w-64 h-64 flex items-end justify-center">
      {/* Soil base */}
      <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-amber-900/80 to-amber-700/80 rounded-lg border border-amber-600/20" />
      
      {/* Plant stem with enhanced growth stages */}
      <motion.div
        className={`relative z-10 rounded-t-full ${getStemColor()}`}
        initial={{ height: 20, width: 8 }}
        animate={{
          height: growthStage === 0 ? 20 : growthStage === 1 ? 40 : growthStage === 2 ? 65 : 85,
          width: growthStage === 0 ? 8 : growthStage === 1 ? 10 : growthStage === 2 ? 12 : 14,
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Stem segments for more realistic growth */}
        {growthStage >= 2 && (
          <motion.div
            className="absolute inset-x-0 h-1 bg-green-800/30 rounded-full"
            style={{ bottom: '60%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        )}
        {growthStage >= 3 && (
          <motion.div
            className="absolute inset-x-0 h-1 bg-green-800/30 rounded-full"
            style={{ bottom: '30%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          />
        )}
      </motion.div>

      {/* Enhanced root system (visible when water is added) */}
      {waterAdded && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-full"
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: (i === 3) ? 25 : Math.random() * 20 + 8,
                  opacity: 1
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
          {/* Root expansion effect */}
          <motion.div
            className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      )}

      {/* Enhanced leaf system (appear when sunlight is added) */}
      {sunlightAdded && (
        <motion.div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative">
            {/* Main leaves with enhanced styling */}
            <motion.div
              className="absolute -left-6 top-0 w-8 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full transform -rotate-45 shadow-sm"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ 
                scale: 1, 
                rotate: -45,
                filter: isPhotosynthesizing ? 'brightness(1.2)' : 'brightness(1)'
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.1 }}
            />
            <motion.div
              className="absolute -right-6 top-0 w-8 h-4 bg-gradient-to-bl from-green-400 to-green-600 rounded-full transform rotate-45 shadow-sm"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ 
                scale: 1, 
                rotate: 45,
                filter: isPhotosynthesizing ? 'brightness(1.2)' : 'brightness(1)'
              }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
            />
            
            {/* Additional leaves as plant grows */}
            {growthStage >= 2 && (
              <>
                <motion.div
                  className="absolute -left-4 -top-2 w-6 h-3 bg-gradient-to-br from-green-300 to-green-500 rounded-full transform -rotate-30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isPhotosynthesizing ? 'brightness(1.3)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                />
                <motion.div
                  className="absolute -right-4 -top-2 w-6 h-3 bg-gradient-to-bl from-green-300 to-green-500 rounded-full transform rotate-30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isPhotosynthesizing ? 'brightness(1.3)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                />
              </>
            )}

            {/* Top leaves for fully grown plant */}
            {growthStage >= 3 && (
              <>
                <motion.div
                  className="absolute -left-5 -top-6 w-7 h-4 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full transform -rotate-20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isPhotosynthesizing ? 'brightness(1.4)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                />
                <motion.div
                  className="absolute -right-5 -top-6 w-7 h-4 bg-gradient-to-bl from-emerald-300 to-emerald-500 rounded-full transform rotate-20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isPhotosynthesizing ? 'brightness(1.4)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                />
              </>
            )}

            {/* Photosynthesis glow on leaves */}
            {isPhotosynthesizing && (
              <motion.div
                className="absolute inset-0 bg-emerald-400/30 rounded-full blur-md"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* CO2 bubbles animation */}
      {co2Added && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gray-400/60 rounded-full"
              initial={{
                x: Math.random() * 200 + 50,
                y: Math.random() * 200 + 50,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: [null, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                repeatDelay: 1,
              }}
            />
          ))}
        </div>
      )}

      {/* Sunlight rays */}
      {sunlightAdded && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-12 bg-yellow-400/60"
              style={{
                left: `${(i - 2) * 8}px`,
                transformOrigin: 'bottom',
              }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                repeatDelay: 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Water droplets animation */}
      {waterAdded && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-2 bg-blue-400 rounded-full"
              initial={{
                x: (i - 1) * 10,
                y: 0,
                opacity: 0,
              }}
              animate={{
                y: [0, 20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                repeatDelay: 1,
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced photosynthesis completion effect */}
      {isPhotosynthesizing && (
        <>
          {/* Main plant glow */}
          <motion.div
            className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Oxygen bubbles being produced */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`oxygen-${i}`}
                className="absolute w-1.5 h-1.5 bg-emerald-400/80 rounded-full"
                initial={{
                  x: (Math.random() - 0.5) * 20,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: -40,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  repeatDelay: 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Success indicator particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`success-${i}`}
                className="absolute w-1 h-1 bg-emerald-300/60 rounded-full"
                style={{
                  left: `${20 + (i * 20)}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  repeatDelay: 1,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};