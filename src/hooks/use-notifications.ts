import { useEffect, useState, useCallback } from 'react';
import notificationManager, { Notification } from '../services/notificationManager';
import { toast } from 'sonner';

/**
 * Hook to manage notifications in components
 */
export function useNotifications(userId: string | null) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize notification manager
  useEffect(() => {
    if (!userId || isInitialized) {
      return;
    }

    const initializeNotifications = async () => {
      try {
        await notificationManager.initialize(userId);
        setIsInitialized(true);
        setIsConnected(true);
        console.log('✅ Notifications initialized for user:', userId);
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
        // Don't show error toast - notifications are optional
        // App will work fine without them
        setIsInitialized(true); // Mark as initialized even if it failed
        setIsConnected(false);
      }
    };

    initializeNotifications();

    return () => {
      notificationManager.disconnect();
      setIsInitialized(false);
      setIsConnected(false);
    };
  }, [userId, isInitialized]);

  // Listen for events
  useEffect(() => {
    if (!isInitialized) return;

    const handleUnreadCountUpdate = (count: number) => {
      setUnreadCount(count);
    };

    const handleNewNotification = (notification: Notification) => {
      // Show toast notification
      toast(notification.title, {
        description: notification.body,
        action: notification.targetUrl ? {
          label: 'View',
          onClick: () => {
            window.location.href = notification.targetUrl!;
          }
        } : undefined,
        duration: 5000,
      });
    };

    const handleShowNotification = (notification: Notification) => {
      // Show in-app notification
      toast(notification.title, {
        description: notification.body,
        duration: 5000,
      });
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      // Don't show toast for disconnection - too noisy
      // Only log to console
    };

    const handleReconnected = () => {
      setIsConnected(true);
      // Show subtle success message only if we were previously disconnected
      toast.success('Reconnected', {
        description: 'Notifications restored',
        duration: 2000
      });
    };

    const handleReconnectFailed = () => {
      setIsConnected(false);
      console.warn('⚠️ Could not connect to notification service');
      // Don't show error - app works fine without notifications
    };

    notificationManager.on('unread-count-updated', handleUnreadCountUpdate);
    notificationManager.on('notification', handleNewNotification);
    notificationManager.on('show-notification', handleShowNotification);
    notificationManager.on('disconnected', handleDisconnected);
    notificationManager.on('reconnected', handleReconnected);
    notificationManager.on('reconnect-failed', handleReconnectFailed);

    // Get initial unread count
    setUnreadCount(notificationManager.getUnreadCount());

    return () => {
      notificationManager.off('unread-count-updated', handleUnreadCountUpdate);
      notificationManager.off('notification', handleNewNotification);
      notificationManager.off('show-notification', handleShowNotification);
      notificationManager.off('disconnected', handleDisconnected);
      notificationManager.off('reconnected', handleReconnected);
      notificationManager.off('reconnect-failed', handleReconnectFailed);
    };
  }, [isInitialized]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await notificationManager.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationManager.markAllAsRead();
  }, []);

  const getUnreadNotifications = useCallback(async () => {
    return await notificationManager.getUnreadNotifications();
  }, []);

  const getNotificationHistory = useCallback(async (limit = 50, offset = 0) => {
    return await notificationManager.getNotificationHistory(limit, offset);
  }, []);

  return {
    isInitialized,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getUnreadNotifications,
    getNotificationHistory
  };
}

