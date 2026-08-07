import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { db } from '@/api/client';
import { UserPlus, Check } from 'lucide-react';

export default function Directory() {
  const { user } = useOutletContext() || {};
  const [people, setPeople] = useState([]);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { db.entities.Person.list(200).then(setPeople).catch(() => {}); }, []);

  const isAdmin = user?.role === 'admin';
  const members = people.filter((p) => p.status !== 'past');

  const invite = async (e) => {
    e.preventDefault();
    setDone(''); setErr('');
    try {
      await db.users.inviteUser(email);
      setDone(`Invitation sent to ${email}.`);
      setEmail('');
    } catch (e2) {
      setErr(e2.message || 'Could not invite.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="label-mono text-dusty-yellow">— MEMBER DIRECTORY —</p>
        <h1 className="font-heading text-5xl mt-2">Who is making Călimara</h1>
        <p className="font-body text-archive-fg/70 mt-1">The crew, right now.</p>
      </div>

      {isAdmin && (
        <section className="border border-archive-line bg-archive-bg2 p-5">
          <p className="label-mono text-dusty-yellow flex items-center gap-1"><UserPlus size={13}/> INVITE A MEMBER</p>
          <form onSubmit={invite} className="mt-3 flex flex-col sm:flex-row gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@school.ro" className="flex-1 bg-archive-bg border border-archive-line px-3 py-2 text-archive-fg focus-ring" />
            <button type="submit" className="bg-cyanotype text-paper px-4 py-2 label-mono hover:bg-dusty-yellow hover:text-ink focus-ring">SEND INVITE</button>
          </form>
          {done && <p className="label-mono text-forest mt-2 flex items-center gap-1"><Check size={13}/> {done}</p>}
          {err && <p className="label-mono text-faded-red mt-2">{err}</p>}
          <p className="font-body text-xs text-archive-muted mt-3">The invitation email contains a sign-in link that creates the account. Everyone joins as a member; admin rights are granted separately in Supabase.</p>
        </section>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-archive-line">
        {members.map((p) => (
          <Link key={p.id} to={`/people/${encodeURIComponent(p.slug || p.name)}`} className="bg-archive-bg2 p-4 hover:bg-archive-bg focus-ring flex flex-col gap-2">
            <div className="aspect-[4/5] bg-archive-bg flex items-center justify-center text-archive-muted label-mono overflow-hidden">
              {p.profile_photo ? <img src={p.profile_photo} alt={p.name} className="w-full h-full object-cover" loading="lazy"/> : 'AWAITING SCAN'}
            </div>
            <p className="font-heading text-lg leading-tight">{p.name}</p>
            <p className="label-mono text-cyanotype">{p.primary_role || (p.roles && p.roles[0]) || 'contributor'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}