import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineState {
  isOnline: boolean;
  pendingActions: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }>;
  setOnline: (online: boolean) => void;
  addPendingAction: (type: string, data: any) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      pendingActions: [],
      
      setOnline: (online) => set({ isOnline: online }),
      
      addPendingAction: (type, data) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            {
              id: crypto.randomUUID(),
              type,
              data,
              timestamp: Date.now(),
            },
          ],
        })),
      
      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter((action) => action.id !== id),
        })),
      
      clearPendingActions: () => set({ pendingActions: [] }),
    }),
    {
      name: 'offline-storage',
    },
  ),
);

// Monitor online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
    console.log('App is online');
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
    console.log('App is offline');
  });
}
