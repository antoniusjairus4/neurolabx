import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/stores/userStore';
import { DashboardHeader } from './DashboardHeader';
import { ProgressOverview } from './ProgressOverview';
import { SubjectGrid } from './SubjectGrid';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchUserData, updateStreak, loading } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
      updateStreak();
    }
  }, [user, fetchUserData, updateStreak]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProgressOverview />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <SubjectGrid />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <QuickActions />
            <RecentActivity />
          </motion.div>
        </div>
      </main>
    </div>
  );
};