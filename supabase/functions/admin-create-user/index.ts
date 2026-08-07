// Admin-only: create an auth user with email + password (service role).
// Password is stored hashed by Supabase Auth — never in public.profile.
//
// Deploy: npx supabase functions deploy admin-create-user --project-ref hkvrkekzdabjkbwrdesw
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROLES = new Set(['user', 'editor', 'admin']);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await caller.from('profile').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const fullName = String(body?.full_name || '').trim();
    const role = String(body?.role || 'user');

    if (!email || !email.includes('@')) return json({ error: 'A valid email is required' }, 400);
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
    if (!ROLES.has(role)) return json({ error: 'Invalid role' }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });
    if (createError) return json({ error: createError.message }, 400);

    const id = created.user?.id;
    if (!id) return json({ error: 'User was not created' }, 500);

    // Trigger may have inserted profile already; set role + name explicitly.
    const { error: profileError } = await admin.from('profile').upsert({
      id,
      email,
      full_name: fullName || null,
      role,
    });
    if (profileError) return json({ error: profileError.message }, 500);

    return json({ id, email, role, full_name: fullName || null });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
