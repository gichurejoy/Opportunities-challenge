/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

type SyncCallback = () => Promise<void>;

class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: any = null;
  private syncCallbacks: Set<SyncCallback> = new Set();
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<() => void> = new Set();
  private hasPendingSyncFlag: boolean = false;
  private isSyncingFlag: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.notifyListeners();
      });

      // Service worker messages (e.g. background sync)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'TRIGGER_OFFLINE_SYNC') {
            this.syncNow();
          }
        });
      }
    }
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  public registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);

            // Register background sync if supported
            if ('sync' in registration) {
              (registration as any).sync.register('sync-opportunities').catch((err: any) => {
                console.warn('[PWA] Background Sync register notice:', err);
              });
            }
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public registerSyncCallback(cb: SyncCallback): () => void {
    this.syncCallbacks.add(cb);
    return () => this.syncCallbacks.delete(cb);
  }

  public markPendingSync(pending: boolean = true) {
    this.hasPendingSyncFlag = pending;
    this.notifyListeners();
  }

  public async syncNow(): Promise<boolean> {
    if (!this.isOnlineStatus || this.isSyncingFlag) return false;
    this.isSyncingFlag = true;
    this.notifyListeners();

    try {
      for (const cb of this.syncCallbacks) {
        await cb();
      }
      this.hasPendingSyncFlag = false;
      return true;
    } catch (err) {
      console.error('[PWA] Offline sync error:', err);
      return false;
    } finally {
      this.isSyncingFlag = false;
      this.notifyListeners();
    }
  }

  private handleOnline() {
    this.isOnlineStatus = true;
    this.notifyListeners();
    this.syncNow();
  }

  private handleOffline() {
    this.isOnlineStatus = false;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  public get isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public get isSyncing(): boolean {
    return this.isSyncingFlag;
  }

  public get hasPendingSync(): boolean {
    return this.hasPendingSyncFlag;
  }

  public get canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.notifyListeners();
    return outcome === 'accepted';
  }
}

export const pwaManager = PWAManager.getInstance();

export function useNetworkStatus(onSyncReady?: SyncCallback) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = pwaManager.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  useEffect(() => {
    if (onSyncReady) {
      const unsubSync = pwaManager.registerSyncCallback(onSyncReady);
      return unsubSync;
    }
  }, [onSyncReady]);

  const promptInstall = useCallback(() => {
    return pwaManager.promptInstall();
  }, []);

  const triggerSync = useCallback(() => {
    return pwaManager.syncNow();
  }, []);

  return {
    isOnline: pwaManager.isOnline,
    isSyncing: pwaManager.isSyncing,
    hasPendingSync: pwaManager.hasPendingSync,
    canInstall: pwaManager.canInstall,
    promptInstall,
    triggerSync,
  };
}
