// Supabase-backed replacement for the Base44 SDK.
//
// It deliberately keeps the Base44 call shapes (`db.entities.Story.list('-created_date', 50)`,
// `db.auth.me()`, `db.integrations.Core.UploadFile({ file })`) so the ~35 pages that consume it
// did not have to be rewritten one by one. Table names are derived from entity names, matching
// scripts/generate-schema.mjs.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

if (!isConfigured) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing; the site will render without data.');
}

// A dummy URL keeps createClient from throwing at import time, so a misconfigured deploy still
// renders the static shell instead of a blank page. Requests then fail and callers fall back.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
});

// Supabase caps an unbounded select at 1000 rows anyway; be explicit about it.
const DEFAULT_LIMIT = 1000;

export function tableName(entity) {
  return entity
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toLowerCase();
}

// Base44's signature is list(sort, limit), but plenty of call sites use the list(limit) shorthand.
export function parseListArgs(first, second) {
  if (typeof first === 'number') return { sort: null, limit: first };
  return { sort: first ?? null, limit: typeof second === 'number' ? second : DEFAULT_LIMIT };
}

export function parseSort(sort) {
  if (!sort) return null;
  const descending = sort.startsWith('-');
  return { column: descending ? sort.slice(1) : sort, ascending: !descending };
}

// Storage keys are attacker-controlled via the public submission form.
export function safeKey(filename) {
  const cleaned = String(filename || 'file').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+/, '').slice(-80);
  return `${Date.now()}-${cleaned || 'file'}`;
}

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

function makeEntity(name) {
  const table = tableName(name);

  const select = (where, sort, limit) => {
    let query = supabase.from(table).select('*');
    for (const [column, value] of Object.entries(where || {})) query = query.eq(column, value);
    const order = parseSort(sort);
    if (order) query = query.order(order.column, { ascending: order.ascending, nullsFirst: false });
    return query.limit(limit);
  };

  return {
    async list(first, second) {
      const { sort, limit } = parseListArgs(first, second);
      return unwrap(await select(null, sort, limit)) ?? [];
    },
    async filter(where, first, second) {
      const { sort, limit } = parseListArgs(first, second);
      return unwrap(await select(where, sort, limit)) ?? [];
    },
    async get(id) {
      return unwrap(await supabase.from(table).select('*').eq('id', id).maybeSingle());
    },
    async create(values) {
      return unwrap(await supabase.from(table).insert(values).select().single());
    },
    async update(id, values) {
      return unwrap(await supabase.from(table).update(values).eq('id', id).select().single());
    },
    async delete(id) {
      unwrap(await supabase.from(table).delete().eq('id', id));
      return { id };
    },
    subscribe(onEvent) {
      const types = { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' };
      const channel = supabase
        .channel(`realtime-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          const type = types[payload.eventType];
          if (type) onEvent({ type, data: type === 'delete' ? payload.old : payload.new });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  };
}

const cache = new Map();
export const entities = new Proxy({}, {
  get(_target, name) {
    if (typeof name !== 'string') return undefined;
    if (!cache.has(name)) cache.set(name, makeEntity(name));
    return cache.get(name);
  }
});

const absolute = (path) => new URL(path || '/', window.location.origin).toString();

export const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    const { data: profile } = await supabase.from('profile').select('*').eq('id', user.id).maybeSingle();
    return {
      ...profile,
      id: user.id,
      email: user.email || profile?.email || '',
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user'
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return Boolean(session);
  },

  async logout(returnTo = '/') {
    await supabase.auth.signOut();
    window.location.href = absolute(returnTo);
  },

  redirectToLogin(returnTo = '/') {
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  },

  async loginViaEmailPassword(email, password) {
    return unwrap(await supabase.auth.signInWithPassword({ email, password }));
  },

  async loginWithProvider(provider, returnTo = '/') {
    return unwrap(await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: absolute(returnTo) }
    }));
  },

  async register({ email, password }) {
    return unwrap(await supabase.auth.signUp({ email, password }));
  },

  async verifyOtp({ email, otpCode }) {
    const data = unwrap(await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' }));
    return { access_token: data.session?.access_token };
  },

  // verifyOtp already stores the session; the Base44 flow needed an explicit hand-off.
  setToken() {},

  async resendOtp(email) {
    return unwrap(await supabase.auth.resend({ type: 'signup', email }));
  },

  async resetPasswordRequest(email) {
    return unwrap(await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absolute('/reset-password')
    }));
  },

  // The recovery link is exchanged for a session by detectSessionInUrl before we get here,
  // so the token in the URL is only a marker; the session is what authorises the change.
  async resetPassword({ newPassword }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('This reset link has expired. Please request a new one.');
    return unwrap(await supabase.auth.updateUser({ password: newPassword }));
  },

  onChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  }
};

export const integrations = {
  Core: {
    async UploadFile({ file }) {
      const key = safeKey(file?.name);
      unwrap(await supabase.storage.from('uploads').upload(key, file, { upsert: false }));
      const { data } = supabase.storage.from('uploads').getPublicUrl(key);
      return { file_url: data.publicUrl };
    }
  }
};

export const db = { entities, auth, integrations, supabase, isConfigured };
