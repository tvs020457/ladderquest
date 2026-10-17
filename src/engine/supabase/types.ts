import { UserProgressV1 } from '../progress/types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface CloudSyncState {
  isConfigured: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage: string | null;
}

export interface UserProgressRow {
  user_id: string;
  progress_data: UserProgressV1;
  updated_at: string;
}
