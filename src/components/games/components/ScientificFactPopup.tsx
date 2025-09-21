import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X } from 'lucide-react';

interface ScientificFactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fact: {
    title: string;
    titleOdia: string;
    description: string;
    descriptionOdia: string;
    type: string;
  };
  language: 'english' | 'odia';
}

export const ScientificFactPopup: React.FC<ScientificFactPopupProps> = ({
  isOpen,
  onClose,
  fact,
  language,
}) => {
  const getFactColor = (type: string) => {
    switch (type) {
      case 'water': return 'from-blue-500/20 to-blue-600/20 border-blue-400/30';
      case 'sunlight': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
      case 'co2': return 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
      default: return 'from-science/20 to-science/30 border-science/30';
    }
  };

  const getFactIcon = (type: string) => {
    const baseClass = "h-6 w-6";
    switch (type) {
      case 'water': return <div className={`${baseClass} rounded-full bg-blue-500`} />;
      case 'sunlight': return <div className={`${baseClass} rounded-full bg-yellow-500`} />;
      case 'co2': return <div className={`${baseClass} rounded-full bg-gray-500`} />;
      default: return <Lightbulb className={baseClass} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              className="relative max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className={`bg-gradient-to-br ${getFactColor(fact.type)} border-2 shadow-xl`}>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <Lightbulb className="h-7 w-7 text-science" />
                      </motion.div>
                      <div>
                        <Badge variant="secondary" className="bg-science/10 text-science border-science/20">
                          {language === 'odia' ? 'ବିଜ୍ଞାନ ତଥ୍ୟ' : 'Science Fact'}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-bold text-foreground">
                      {language === 'odia' ? fact.titleOdia : fact.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'odia' ? fact.descriptionOdia : fact.description}
                    </p>

                    {/* Decorative element */}
                    <div className="flex items-center justify-center mt-4">
                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        {getFactIcon(fact.type)}
                        <motion.div
                          className="w-8 h-0.5 bg-gradient-to-r from-science/60 to-transparent"
                          initial={{ width: 0 }}
                          animate={{ width: 32 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        />
                      </motion.div>
                    </div>

                    {/* Tap to continue */}
                    <motion.p
                      className="text-center text-xs text-muted-foreground mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.4 }}
                    >
                      {language === 'odia' ? 'ଜାରି ରଖିବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ' : 'Tap anywhere to continue'}
                    </motion.p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};