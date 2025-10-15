/**
 * Service Worker for Push Notifications
 * Handles push events, notification display, and notification clicks
 */

// Service Worker version - increment to force update
const VERSION = '1.0.0';
const CACHE_NAME = 'water-supply-v' + VERSION;

// Assets to cache for offline support
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Push event - receive and display notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {}
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
      console.log('[SW] Push data:', notificationData);
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    tag: notificationData.tag || 'default',
    requireInteraction: notificationData.requireInteraction || false,
    vibrate: notificationData.vibrate || [200, 100, 200],
    data: notificationData.data || {},
    actions: notificationData.actions || [
      { action: 'view', title: 'View', icon: '/icon-view.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icon-dismiss.png' }
    ],
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[SW] Notification displayed');
        
        // Update badge count
        if (notificationData.badgeCount !== undefined) {
          if ('setAppBadge' in self.navigator) {
            self.navigator.setAppBadge(notificationData.badgeCount);
          }
        }

        // Play sound (if supported)
        return playNotificationSound();
      })
      .catch((error) => {
        console.error('[SW] Error showing notification:', error);
      })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    // User dismissed the notification
    return;
  }

  // Get target URL from notification data
  const targetUrl = event.notification.data.targetUrl || '/';
  const notificationId = event.notification.data.notificationId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              // Send message to client to navigate
              return client.postMessage({
                type: 'NOTIFICATION_CLICKED',
                url: targetUrl,
                notificationId: notificationId,
                action: event.action
              });
            });
          }
        }

        // No window open, open new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);

  // You can track dismissals here if needed
  const notificationId = event.notification.data.notificationId;
  
  if (notificationId) {
    // Optionally send dismissal tracking to backend
    event.waitUntil(
      fetch('/api/notifications/dismissed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      }).catch((error) => {
        console.log('[SW] Failed to track dismissal:', error);
      })
    );
  }
});

// Background sync event (for offline support)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      syncNotifications()
    );
  }
});

// Background fetch event (for iOS)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'fetch-notifications') {
    event.waitUntil(
      fetchNewNotifications()
    );
  }
});

// Message event - communicate with clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }

  if (event.data.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in self.navigator) {
      self.navigator.clearAppBadge();
    }
  }

  if (event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;
    if ('setAppBadge' in self.navigator) {
      if (count > 0) {
        self.navigator.setAppBadge(count);
      } else {
        self.navigator.clearAppBadge();
      }
    }
  }
});

// Helper function to play notification sound
async function playNotificationSound() {
  try {
    // Note: Sound playing in service worker is limited
    // Better to play sound in the app when it's active
    console.log('[SW] Notification sound (handled by system)');
  } catch (error) {
    console.error('[SW] Error playing sound:', error);
  }
}

// Helper function to sync notifications
async function syncNotifications() {
  try {
    console.log('[SW] Syncing notifications...');
    
    // Fetch pending notifications from backend
    const response = await fetch('/api/notifications/pending');
    
    if (response.ok) {
      const data = await response.json();
      console.log('[SW] Synced notifications:', data.count);
      
      // Update badge
      if ('setAppBadge' in self.navigator && data.count > 0) {
        await self.navigator.setAppBadge(data.count);
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing notifications:', error);
  }
}

// Helper function to fetch new notifications (for iOS)
async function fetchNewNotifications() {
  try {
    console.log('[SW] Fetching new notifications...');
    
    const response = await fetch('/api/notifications/pending?limit=10');
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Show notifications
        for (const notification of data.data.slice(0, 3)) {
          await self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.id,
            data: {
              notificationId: notification.id,
              targetUrl: notification.targetUrl
            }
          });
        }
        
        // Update badge
        if ('setAppBadge' in self.navigator) {
          await self.navigator.setAppBadge(data.count);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Error fetching notifications:', error);
  }
}

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ success: false, message: 'Offline' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Cache first strategy for assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/index.html');
      })
  );
});

console.log('[SW] Service Worker loaded, version:', VERSION);

