import React from 'react';
import { motion } from 'framer-motion';

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
  return (
    <div className="relative w-64 h-64 flex items-end justify-center">
      {/* Soil base */}
      <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-amber-800 to-amber-600 rounded-lg" />
      
      {/* Plant stem */}
      <motion.div
        className="relative z-10 bg-green-600 rounded-t-full"
        initial={{ height: 20, width: 8 }}
        animate={{
          height: growthStage >= 1 ? (growthStage >= 3 ? 80 : 50) : 20,
          width: growthStage >= 1 ? (growthStage >= 3 ? 12 : 10) : 8,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Roots (visible when water is added) */}
      {waterAdded && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-amber-700 rounded-b-full"
                initial={{ height: 0 }}
                animate={{ height: Math.random() * 20 + 10 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Leaves (appear when sunlight is added) */}
      {sunlightAdded && (
        <motion.div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            {/* Left leaf */}
            <motion.div
              className="absolute -left-6 top-0 w-8 h-4 bg-green-500 rounded-full transform -rotate-45"
              whileHover={{ scale: 1.1 }}
            />
            {/* Right leaf */}
            <motion.div
              className="absolute -right-6 top-0 w-8 h-4 bg-green-500 rounded-full transform rotate-45"
              whileHover={{ scale: 1.1 }}
            />
            {/* Top leaves (when fully grown) */}
            {growthStage >= 3 && (
              <>
                <motion.div
                  className="absolute -left-4 -top-4 w-6 h-3 bg-green-400 rounded-full transform -rotate-30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                />
                <motion.div
                  className="absolute -right-4 -top-4 w-6 h-3 bg-green-400 rounded-full transform rotate-30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                />
              </>
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

      {/* Photosynthesis glow effect when all elements are added */}
      {waterAdded && sunlightAdded && co2Added && (
        <motion.div
          className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};