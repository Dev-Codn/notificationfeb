/**
 * Notification Manager
 * Handles push notification subscriptions, WebSocket connections, and notification state
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

export type NotificationType =
  | 'order_assigned'
  | 'order_completed'
  | 'order_cancelled'
  | 'payment_received'
  | 'system_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  targetUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface DeviceInfo {
  deviceType: 'android' | 'ios' | 'desktop' | 'tablet';
  deviceName?: string;
  pushSubscription?: PushSubscription;
  fcmToken?: string;
}

class NotificationManager {
  private socket: Socket | null = null;
  private deviceId: string | null = null;
  private userId: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey: string | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private unreadCount: number = 0;
  private initializationAttempts: number = 0;
  private maxInitializationAttempts: number = 3;
  private isInitializing: boolean = false;

  /**
   * Initialize notification system
   */
  async initialize(userId: string): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log('⏳ Initialization already in progress...');
      return;
    }

    // Check if already exceeded max attempts
    if (this.initializationAttempts >= this.maxInitializationAttempts) {
      console.warn('⚠️ Max initialization attempts reached. Notification system disabled.');
      return;
    }

    this.isInitializing = true;
    this.initializationAttempts++;
    
    console.log(`📬 Initializing Notification Manager for user: ${userId} (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})`);
    this.userId = userId;

    try {
      // Register service worker
      await this.registerServiceWorker();

      // Get VAPID public key (with error handling)
      try {
        await this.fetchVapidPublicKey();
      } catch (vapidError) {
        console.warn('⚠️ Could not fetch VAPID key, push notifications will be disabled');
        // Continue without push notifications
      }

      // Request notification permission
      const permission = await this.requestPermission();

      if (permission === 'granted' && this.vapidPublicKey) {
        // Subscribe to push notifications only if VAPID key is available
        try {
          await this.subscribeToPushNotifications();
        } catch (pushError) {
          console.warn('⚠️ Could not subscribe to push notifications:', pushError);
          // Continue without push
        }
      } else {
        console.warn('⚠️ Push notifications not available');
      }

      // Connect WebSocket for in-app notifications
      this.connectWebSocket();

      // Setup service worker message listener
      this.setupServiceWorkerListener();

      // Setup visibility change listener (for iOS fallback)
      this.setupVisibilityChangeListener();

      console.log('✅ Notification Manager initialized');
      this.isInitializing = false;
    } catch (error) {
      console.error('❌ Failed to initialize Notification Manager:', error);
      this.isInitializing = false;
      
      // Don't throw error, just log it
      // This prevents the app from breaking if notifications fail
      console.warn('⚠️ Continuing without full notification support');
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        const newWorker = this.registration?.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🆕 New service worker available');
            this.emit('sw-update-available');
          }
        });
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Fetch VAPID public key from backend
   */
  private async fetchVapidPublicKey(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/vapid-public-key`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        this.vapidPublicKey = data.publicKey;
        console.log('✅ VAPID public key fetched');
      } else {
        throw new Error('Failed to fetch VAPID key');
      }
    } catch (error) {
      console.error('❌ Error fetching VAPID key:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.registration || !this.vapidPublicKey) {
      console.warn('⚠️ Cannot subscribe: missing registration or VAPID key');
      return;
    }

    try {
      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource
        });

        console.log('✅ Push subscription created');
      } else {
        console.log('✅ Already subscribed to push');
      }

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);
    } catch (error) {
      console.error('❌ Failed to subscribe to push:', error);
    }
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const deviceInfo: DeviceInfo = {
        deviceType: this.detectDeviceType(),
        deviceName: this.getDeviceName(),
        pushSubscription: subscription.toJSON() as any
      };

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          deviceInfo
        })
      });

      const data = await response.json();

      if (data.success) {
        this.deviceId = data.data.deviceId;
        localStorage.setItem('deviceId', this.deviceId!);
        console.log('✅ Device registered:', this.deviceId);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Failed to send subscription to backend:', error);
    }
  }

  /**
   * Connect WebSocket for real-time notifications
   */
  private connectWebSocket(): void {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    const socketUrl = API_BASE_URL.replace('/api', '');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5, // Reduced from 10
      timeout: 10000
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', this.socket?.id);
      
      // Authenticate
      this.socket?.emit('authenticate', {
        userId: this.userId,
        deviceId: this.deviceId,
        deviceInfo: {
          deviceType: this.detectDeviceType()
        }
      });
    });

    this.socket.on('connection:verified', (data) => {
      console.log('✅ WebSocket authenticated:', data);
      this.unreadCount = data.unreadCount || 0;
      this.emit('unread-count-updated', this.unreadCount);
      this.updateBadge(this.unreadCount);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.emit('disconnected');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after all attempts');
      this.emit('reconnect-failed');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    // Notification events
    this.socket.on('notification:new', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      
      // Increment unread count
      this.unreadCount++;
      this.emit('unread-count-updated', this.unreadCount);
      this.updateBadge(this.unreadCount);

      // Show in-app notification if window is focused
      if (document.visibilityState === 'visible') {
        this.showInAppNotification(notification);
      }

      // Play sound
      this.playNotificationSound();

      // Emit to listeners
      this.emit('notification', notification);
    });

    this.socket.on('notification:read-sync', (data) => {
      console.log('📖 Notification read sync:', data);
      this.emit('notification-read', data.notificationId);
    });

    this.socket.on('notification:all-read', () => {
      console.log('✅ All notifications marked as read');
      this.unreadCount = 0;
      this.emit('unread-count-updated', 0);
      this.updateBadge(0);
      this.emit('all-read');
    });

    this.socket.on('notification:badge-update', (data) => {
      console.log('🔔 Badge update:', data.count);
      this.unreadCount = data.count;
      this.emit('unread-count-updated', data.count);
      this.updateBadge(data.count);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Setup service worker message listener
   */
  private setupServiceWorkerListener(): void {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Message from Service Worker:', event.data);

      if (event.data.type === 'NOTIFICATION_CLICKED') {
        // Handle notification click
        this.handleNotificationClick(
          event.data.notificationId,
          event.data.url
        );
      }
    });
  }

  /**
   * Setup visibility change listener (for iOS)
   */
  private setupVisibilityChangeListener(): void {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 App became visible, checking for notifications...');
        
        // Fetch missed notifications (iOS fallback)
        await this.fetchMissedNotifications();
      }
    });
  }

  /**
   * Fetch missed notifications (for iOS)
   */
  private async fetchMissedNotifications(): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/pending?userId=${this.userId}&limit=10`
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        console.log('📬 Found missed notifications:', data.count);
        
        // Show catch-up notifications
        for (const notification of data.data.slice(0, 3)) {
          this.showInAppNotification(notification);
        }

        // Update count
        this.unreadCount = data.count;
        this.emit('unread-count-updated', data.count);
        this.updateBadge(data.count);
      }
    } catch (error) {
      console.error('❌ Error fetching missed notifications:', error);
    }
  }

  /**
   * Show in-app notification
   */
  private showInAppNotification(notification: Notification): void {
    // Emit for in-app notification UI
    this.emit('show-notification', notification);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notificationId: string, url: string): void {
    console.log('👆 Handling notification click:', notificationId, url);

    // Mark as clicked
    this.markAsClicked(notificationId);

    // Navigate to URL
    if (url) {
      window.location.href = url;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Send via WebSocket for instant sync
      this.socket?.emit('notification:mark-read', { notificationId });

      // Also send via HTTP as fallback
      await fetch(`${API_BASE_URL}/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, userId: this.userId })
      });

      // Decrement unread count
      if (this.unreadCount > 0) {
        this.unreadCount--;
        this.emit('unread-count-updated', this.unreadCount);
        this.updateBadge(this.unreadCount);
      }
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }

  /**
   * Mark notification as clicked
   */
  async markAsClicked(notificationId: string): Promise<void> {
    try {
      this.socket?.emit('notification:clicked', { notificationId });
      await this.markAsRead(notificationId);
    } catch (error) {
      console.error('❌ Error marking as clicked:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      this.socket?.emit('notification:mark-all-read');
      
      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });

      this.unreadCount = 0;
      this.emit('unread-count-updated', 0);
      this.updateBadge(0);
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/pending?userId=${this.userId}&limit=50`
      );
      const data = await response.json();

      return data.success ? data.data : [];
    } catch (error) {
      console.error('❌ Error getting unread notifications:', error);
      return [];
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/history?userId=${this.userId}&limit=${limit}&offset=${offset}`
      );
      const data = await response.json();

      return data.success ? data.data : [];
    } catch (error) {
      console.error('❌ Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Update app badge
   */
  private updateBadge(count: number): void {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }

    // Also send to service worker
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'UPDATE_BADGE',
        count
      });
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch((e) => {
        console.log('Could not play sound:', e);
      });
    } catch (error) {
      console.log('Sound not available');
    }
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): 'android' | 'ios' | 'desktop' | 'tablet' {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/tablet|ipad/.test(ua)) return 'tablet';
    
    return 'desktop';
  }

  /**
   * Get device name
   */
  private getDeviceName(): string {
    const ua = navigator.userAgent;
    return ua.substring(0, 50); // First 50 chars of user agent
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Event listener management
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
    console.log('📪 Notification Manager disconnected');
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
export default notificationManager;

