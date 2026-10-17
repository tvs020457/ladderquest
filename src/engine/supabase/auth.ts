import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

export interface AuthUserSummary {
  id: string;
  email: string | null;
  isAnonymous: boolean;
}

export async function getCurrentSession(): Promise<{ user: AuthUserSummary | null; session: Session | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, session: null };

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return { user: null, session: null };

    const u = data.session.user;
    return {
      user: {
        id: u.id,
        email: u.email ?? null,
        isAnonymous: Boolean(u.is_anonymous),
      },
      session: data.session,
    };
  } catch (err) {
    console.error('Error fetching Supabase session:', err);
    return { user: null, session: null };
  }
}

export async function signInAsGuest(): Promise<{ user: AuthUserSummary | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, error: 'Supabase is not configured yet.' };

  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Failed to create anonymous account' };

    return {
      user: {
        id: data.user.id,
        email: null,
        isAnonymous: true,
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Anonymous sign-in failed' };
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: AuthUserSummary | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, error: 'Supabase is not configured yet.' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'User not found' };

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        isAnonymous: false,
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Sign in failed' };
  }
}

export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: AuthUserSummary | null; error: string | null; message?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { user: null, error: 'Supabase is not configured yet.' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) return { user: null, error: error.message };

    const u = data.user;
    return {
      user: u
        ? {
            id: u.id,
            email: u.email ?? null,
            isAnonymous: false,
          }
        : null,
      error: null,
      message: data.session ? 'Account created and signed in!' : 'Account registered! Please check your email to confirm.',
    };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Sign up failed' };
  }
}

export async function signOutSupabase(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err?.message || 'Sign out failed' };
  }
}

export function subscribeToAuthChanges(
  callback: (user: AuthUserSummary | null, event: AuthChangeEvent) => void
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback(
        {
          id: session.user.id,
          email: session.user.email ?? null,
          isAnonymous: Boolean(session.user.is_anonymous),
        },
        event
      );
    } else {
      callback(null, event);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
