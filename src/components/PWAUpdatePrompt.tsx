import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAUpdatePrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Handle PWA update available
    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleUpdateClick = () => {
    window.location.reload();
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  if (!showInstallPrompt && !showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {showInstallPrompt ? 'Install App' : 'Update Available'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={showInstallPrompt ? dismissInstall : dismissUpdate}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {showInstallPrompt 
              ? 'Install Smart Supply for quick access and offline functionality.'
              : 'A new version is available. Update now for the latest features.'
            }
          </CardDescription>
          <div className="flex gap-2">
            <Button 
              onClick={showInstallPrompt ? handleInstallClick : handleUpdateClick}
              className="flex-1"
            >
              {showInstallPrompt ? 'Install' : 'Update'}
            </Button>
            <Button 
              variant="outline" 
              onClick={showInstallPrompt ? dismissInstall : dismissUpdate}
            >
              {showInstallPrompt ? 'Not now' : 'Later'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
