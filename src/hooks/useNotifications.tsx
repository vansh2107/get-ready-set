import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { scheduleLocalNotifications } from '@/services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // Schedule all pending notifications when app starts
      scheduleLocalNotifications(user.id);
    }
  }, [user?.id]);

  return null;
};
