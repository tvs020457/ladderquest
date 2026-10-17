import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './types';

const CONFIG_STORAGE_KEY = 'ladderquest_supabase_config_v1';

let cachedClient: SupabaseClient | null = null;
let cachedConfigStr = '';

function normalizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

/**
 * Reads Supabase config from environment variables or custom localStorage.
 */
export function getActiveSupabaseConfig(): SupabaseConfig | null {
  // 1. Check environment variables
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

  if (envUrl && envAnonKey) {
    return { url: normalizeSupabaseUrl(envUrl), anonKey: envAnonKey };
  }

  // 2. Check localStorage override
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.url === 'string' &&
        typeof parsed.anonKey === 'string' &&
        parsed.url.startsWith('http')
      ) {
        return { url: normalizeSupabaseUrl(parsed.url), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch (err) {
    console.warn('Failed to parse custom Supabase config from storage:', err);
  }

  return null;
}

/**
 * Checks if Supabase client can be initialized.
 */
export function isSupabaseConfigured(): boolean {
  return getActiveSupabaseConfig() !== null;
}

/**
 * Returns singleton Supabase client or null if unconfigured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getActiveSupabaseConfig();
  if (!config) {
    cachedClient = null;
    cachedConfigStr = '';
    return null;
  }

  const configStr = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigStr === configStr) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedConfigStr = configStr;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Persists custom Supabase config to localStorage.
 */
export function saveCustomSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();
    if (!trimmedUrl.startsWith('http') || !trimmedKey) {
      return false;
    }
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey }));
    cachedClient = null;
    cachedConfigStr = '';
    return true;
  } catch (err) {
    console.error('Failed to save Supabase config:', err);
    return false;
  }
}

/**
 * Clears custom config from localStorage.
 */
export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    cachedClient = null;
    cachedConfigStr = '';
  } catch (err) {
    console.error('Failed to clear Supabase config:', err);
  }
}
