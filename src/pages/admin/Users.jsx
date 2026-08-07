import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { db, supabase } from '@/api/client';

const ROLES = ['user', 'editor', 'admin'];

export default function Users() {
  const { isAdmin } = useOutletContext() || {};
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRoleForm] = useState('user');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profile').select('*').order('created_date', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (e) {
      setErr(e.message || 'Could not load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!isAdmin) {
    return <p className="font-body text-faded-red">Only admins can manage user roles.</p>;
  }

  const setRole = async (id, nextRole) => {
    try {
      const { error } = await supabase.from('profile').update({ role: nextRole }).eq('id', id);
      if (error) throw error;
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: nextRole } : p)));
    } catch (e) {
      alert(e.message || 'Role update failed');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await db.users.createWithPassword({
        email: email.trim(),
        password,
        role,
        full_name: fullName.trim(),
      });
      setMsg(`Created ${email.trim()} (${role}). They can sign in with this password now.`);
      setEmail('');
      setPassword('');
      setFullName('');
      setRoleForm('user');
      await load();
    } catch (e2) {
      setErr(e2.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— ACCESS —</p>
        <h1 className="font-heading text-5xl mt-2">Users &amp; roles</h1>
        <p className="font-body text-archive-fg/70 mt-1 max-w-2xl">
          Create accounts with an email and password. The password is stored hashed in Supabase Auth
          (not in the magazine tables). Roles: admin (full), editor (content), user (editorial room).
        </p>
      </div>

      <section className="border border-archive-line bg-archive-bg2 p-5">
        <p className="label-mono text-dusty-yellow flex items-center gap-2"><UserPlus size={14} /> CREATE USER</p>
        <form onSubmit={createUser} className="mt-3 grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1 sm:col-span-2">
            <span className="label-mono text-archive-muted text-[0.65rem]">EMAIL</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@school.ro"
              className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
            />
          </label>
          <label className="block space-y-1">
            <span className="label-mono text-archive-muted text-[0.65rem]">FULL NAME</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Optional"
              className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
            />
          </label>
          <label className="block space-y-1">
            <span className="label-mono text-archive-muted text-[0.65rem]">ROLE</span>
            <select
              value={role}
              onChange={(e) => setRoleForm(e.target.value)}
              className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="label-mono text-archive-muted text-[0.65rem]">PASSWORD (min 8)</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-archive-bg border border-archive-line px-3 py-2 focus-ring"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 label-mono bg-cyanotype text-paper px-4 py-2.5 focus-ring disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            CREATE ACCOUNT
          </button>
        </form>
        {msg && <p className="label-mono text-forest mt-2">{msg}</p>}
        {err && <p className="label-mono text-faded-red mt-2">{err}</p>}
      </section>

      {loading && <p className="label-mono text-archive-muted">loading…</p>}

      <div className="border border-archive-line overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-archive-bg2 border-b border-archive-line">
            <tr>
              <th className="label-mono text-archive-muted px-3 py-2 font-normal">Email</th>
              <th className="label-mono text-archive-muted px-3 py-2 font-normal">Name</th>
              <th className="label-mono text-archive-muted px-3 py-2 font-normal">Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-archive-line">
                <td className="px-3 py-2.5 font-body text-sm">{p.email}</td>
                <td className="px-3 py-2.5 font-body text-sm">{p.full_name || '—'}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={p.role || 'user'}
                    onChange={(e) => setRole(p.id, e.target.value)}
                    className="bg-archive-bg2 border border-archive-line px-2 py-1 label-mono focus-ring"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
