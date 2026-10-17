import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import {
  isSupabaseConfigured,
  getActiveSupabaseConfig,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '../../engine/supabase/client';
import {
  getCurrentSession,
  signInAsGuest,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOutSupabase,
  AuthUserSummary,
} from '../../engine/supabase/auth';
import {
  fetchRemoteProgress,
  uploadRemoteProgress,
  mergeProgress,
} from '../../engine/supabase/progressSync';
import { UserProgressV1 } from '../../engine/progress/types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localProgress: UserProgressV1;
  onSyncComplete: (merged: UserProgressV1) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  localProgress,
  onSyncComplete,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUserSummary | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfigEdit, setShowConfigEdit] = useState(false);

  // Custom credentials form state
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  // Auth form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Loading & status states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Refresh config and session state
  const refreshState = async () => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    const activeConfig = getActiveSupabaseConfig();
    if (activeConfig) {
      setCustomUrl(activeConfig.url);
      setCustomKey(activeConfig.anonKey);
    }

    if (configured) {
      const { user } = await getCurrentSession();
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setErrorMessage(null);
      refreshState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle saving custom Supabase credentials
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!customUrl.trim().startsWith('http')) {
      setErrorMessage('Please enter a valid Supabase project URL (starts with https://)');
      return;
    }
    if (!customKey.trim()) {
      setErrorMessage('Please enter your Supabase anon public API key');
      return;
    }

    const saved = saveCustomSupabaseConfig(customUrl, customKey);
    if (!saved) {
      setErrorMessage('Failed to save Supabase configuration');
      return;
    }

    setShowConfigEdit(false);
    setStatusMessage('Supabase credentials configured!');
    await refreshState();
  };

  const handleClearConfig = async () => {
    clearCustomSupabaseConfig();
    setShowConfigEdit(false);
    setStatusMessage('Custom credentials cleared. Using environment or offline defaults.');
    await refreshState();
  };

  // Perform full 2-way sync
  const performSync = async (userToSync: AuthUserSummary) => {
    setLoading(true);
    setStatusMessage('Syncing with Supabase cloud...');
    setErrorMessage(null);

    try {
      // 1. Fetch remote progress
      const remote = await fetchRemoteProgress(userToSync.id);
      let merged = localProgress;

      if (remote) {
        merged = mergeProgress(localProgress, remote);
        onSyncComplete(merged);
      }

      // 2. Upload merged progress back to cloud
      const uploadResult = await uploadRemoteProgress(userToSync.id, merged);
      if (!uploadResult.success) {
        setErrorMessage(uploadResult.error || 'Cloud sync upload failed');
      } else {
        const now = new Date().toLocaleTimeString();
        setLastSyncedAt(now);
        setStatusMessage(`Successfully synced with cloud at ${now} ✨`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sync failed due to a network error');
    } finally {
      setLoading(false);
    }
  };

  // Handle guest sign in
  const handleGuestSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Creating guest session...');

    const res = await signInAsGuest();
    setLoading(false);

    if (res.error || !res.user) {
      setErrorMessage(res.error || 'Could not sign in as guest');
      return;
    }

    setCurrentUser(res.user);
    await performSync(res.user);
  };

  // Handle email sign in / sign up
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password');
      setLoading(false);
      return;
    }

    if (authMode === 'signup') {
      const res = await signUpWithEmailPassword(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
      setStatusMessage(res.message || 'Account created!');
      if (res.user) {
        setCurrentUser(res.user);
        await performSync(res.user);
      }
    } else {
      const res = await signInWithEmailPassword(email, password);
      setLoading(false);
      if (res.error || !res.user) {
        setErrorMessage(res.error || 'Sign in failed');
        return;
      }
      setCurrentUser(res.user);
      await performSync(res.user);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setLoading(true);
    await signOutSupabase();
    setCurrentUser(null);
    setLoading(false);
    setStatusMessage('Signed out. Local progress remains intact on this device.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '24px',
          padding: '24px',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '2px solid var(--color-bg-tertiary)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Supabase Cloud Sync
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Store progress securely in the cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.3rem',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(101, 170, 187, 0.15)',
              border: '1px solid var(--color-1)',
              color: 'var(--color-1)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Case 1: Supabase not configured */}
        {!isConfigured && !showConfigEdit ? (
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid var(--color-bg-tertiary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem' }}>☁️</div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              Connect Your Supabase Project
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              Set your Supabase Project URL and Anon Public Key in <code style={{ color: 'var(--color-1)' }}>.env.local</code> or enter them directly below to enable cloud database sync.
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setShowConfigEdit(true)}
            >
              ⚙️ Enter Supabase Credentials
            </Button>
          </div>
        ) : showConfigEdit ? (
          /* Credentials Configuration Form */
          <form
            onSubmit={handleSaveConfig}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid var(--color-bg-tertiary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                Supabase Credentials
              </span>
              <button
                type="button"
                onClick={() => setShowConfigEdit(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                Project URL:
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                Anon Public Key:
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Button type="submit" variant="primary" size="md" fullWidth>
                Save & Connect
              </Button>
              {isConfigured && (
                <Button type="button" variant="secondary" size="md" onClick={handleClearConfig}>
                  Clear
                </Button>
              )}
            </div>
          </form>
        ) : currentUser ? (
          /* Case 2: Configured and User is Authenticated */
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid var(--color-bg-tertiary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-3)' }}>
                  ● CONNECTED TO SUPABASE
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                  {currentUser.isAnonymous ? '👤 Guest Player' : `✉️ ${currentUser.email}`}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  User ID: {currentUser.id.slice(0, 16)}...
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigEdit(true)}
                title="Edit Supabase credentials"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                ⚙️
              </button>
            </div>

            {lastSyncedAt && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-1)', fontWeight: 700 }}>
                ✓ Last synced: {lastSyncedAt}
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
              onClick={() => performSync(currentUser)}
            >
              {loading ? '⏳ Syncing...' : '☁️ Sync Progress Now'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={loading}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          /* Case 3: Configured, but user not signed in */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Quick Guest Sync option */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid var(--color-bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-3)' }}>
                ⚡ INSTANT SYNC
              </span>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                No password required. Connects an anonymous cloud session right now.
              </p>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={loading}
                onClick={handleGuestSignIn}
              >
                {loading ? 'Connecting...' : '🚀 Continue as Guest'}
              </Button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>
              — OR SIGN IN WITH EMAIL —
            </div>

            {/* Email form */}
            <form
              onSubmit={handleAuthSubmit}
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid var(--color-bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Tab selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'signin' ? 'var(--color-1)' : 'transparent',
                    color: authMode === 'signin' ? '#0d161a' : '#94a3b8',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'signup' ? 'var(--color-1)' : 'transparent',
                    color: authMode === 'signup' ? '#0d161a' : '#94a3b8',
                  }}
                >
                  Create Account
                </button>
              </div>

              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />

              <input
                type="password"
                required
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-bg-tertiary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              />

              <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
                {loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In & Sync' : 'Register & Sync'}
              </Button>
            </form>
          </div>
        )}

        {/* Database setup notice */}
        <div
          style={{
            fontSize: '0.7rem',
            color: '#64748b',
            lineHeight: 1.4,
            textAlign: 'center',
            borderTop: '1px solid var(--color-bg-tertiary)',
            paddingTop: '10px',
          }}
        >
          LadderQuest stores data in your Supabase table <code style={{ color: 'var(--color-1)' }}>user_progress</code> with Row Level Security. See <code style={{ color: 'var(--color-3)' }}>supabase/schema.sql</code>.
        </div>
      </div>
    </div>
  );
};
