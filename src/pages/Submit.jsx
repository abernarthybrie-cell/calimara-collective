import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/lib/calimara';
import Stamp from '@/components/Stamp';

const DEFAULT_TYPES = ['Poetry', 'Fiction', 'Creative Nonfiction', 'Essays', 'Personal Writing', 'Interviews', 'Photography', 'Illustration', 'Visual Art', 'Graphic Design', 'Other'];

export default function Submit() {
  const { settings } = useSettings();
  const [calls, setCalls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ submitter_name: '', email: '', age: '', school: '', category: '', title: '', description: '', portfolio_link: '', instagram: '', note: '', consent: false });
  const [file, setFile] = useState(null);

  useEffect(() => {
    base44.entities.OpenCall.list('order', 50).then(setCalls).catch(() => {});
  }, []);

  const featured = calls.find((c) => c.featured && c.status !== 'closed') || calls.find((c) => c.status === 'open') || calls.find((c) => c.status === 'closing_soon');
  const types = settings?.submission_types?.length ? settings.submission_types : DEFAULT_TYPES;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) return;
    setSubmitting(true);
    try {
      let file_url = '';
      if (file) {
        const up = await base44.integrations.Core.UploadFile({ file });
        file_url = up.file_url;
      }
      await base44.entities.Submission.create({
        ...form,
        file_url,
        date_submitted: new Date().toISOString().slice(0, 10),
        status: 'new',
        issue_number: featured?.issue_number || null,
      });
      setDone(true);
    } catch (err) {
      alert('Something went wrong sending your work. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-paper-deep grain pt-14 pb-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— SUBMIT YOUR WORK —</p>
          <h1 className="font-heading text-6xl md:text-8xl leading-[0.9]">Have something to say?</h1>
          <p className="font-heading italic text-2xl md:text-3xl text-ink-soft mt-5 max-w-2xl leading-snug">
            {settings?.submit_intro || 'Send it our way. A poem, an essay, an illustration, a photograph — or something we haven\'t thought of yet. We want to see what you are making.'}
          </p>
        </div>
      </section>

      {/* OPEN CALLS */}
      <section className="py-14 bg-paper grain">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-6">— OPEN CALLS —</p>
          {calls.length === 0 ? (
            <div className="bg-paper-deep border border-ink/15 p-6">
              <p className="font-hand text-2xl text-ink-soft">No open call at this exact moment — but we always read what you send.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {calls.map((c) => (
                <div key={c.id} className={`border p-6 ${c === featured ? 'bg-ink text-paper border-ink' : 'bg-paper-deep border-ink/15'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Stamp className={c === featured ? 'text-dusty-yellow' : 'text-burgundy'}>{c.status.replace('_', ' ').toUpperCase()}</Stamp>
                        {c.issue_number && <span className={`label-mono ${c === featured ? 'text-paper/60' : 'text-ink-soft/60'}`}>ISSUE {String(c.issue_number).padStart(2, '0')}</span>}
                      </div>
                      <h3 className="font-heading text-3xl mt-3">{c.title}</h3>
                      {c.theme && <p className={`font-heading italic text-xl mt-1 ${c === featured ? 'text-paper/80' : 'text-ink-soft'}`}>theme · {c.theme}</p>}
                    </div>
                    {c.deadline && <p className={`label-mono ${c === featured ? 'text-dusty-yellow' : 'text-burgundy'}`}>DEADLINE · {c.deadline}</p>}
                  </div>
                  {c.description && <p className={`font-body mt-3 max-w-prose ${c === featured ? 'text-paper/80' : 'text-ink-soft'}`}>{c.description}</p>}
                  {c.accepted_formats?.length > 0 && (
                    <p className={`label-mono mt-3 ${c === featured ? 'text-paper/60' : 'text-ink-soft/60'}`}>SEND US · {c.accepted_formats.join(' · ')}</p>
                  )}
                  {c.submission_method === 'external' && c.submission_link ? (
                    <a href={c.submission_link} target="_blank" rel="noreferrer" className={`mt-5 inline-flex items-center gap-2 label-mono underline underline-offset-4 focus-ring ${c === featured ? 'text-dusty-yellow' : 'text-burgundy'}`}>SUBMIT YOUR WORK <ArrowRight size={14} /></a>
                  ) : (
                    <a href="#submit-form" className={`mt-5 inline-flex items-center gap-2 label-mono underline underline-offset-4 focus-ring ${c === featured ? 'text-dusty-yellow' : 'text-burgundy'}`}>SUBMIT YOUR WORK <ArrowRight size={14} /></a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GUIDELINES */}
      {settings?.submit_guidelines?.length > 0 && (
        <section className="py-14 bg-archive-bg text-archive-fg grain">
          <div className="mx-auto max-w-[900px] px-6 lg:px-10">
            <p className="label-mono text-dusty-yellow mb-6">— SUBMISSION GUIDELINES —</p>
            <ol className="space-y-3">
              {settings.submit_guidelines.map((g, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-heading text-3xl text-dusty-yellow/50">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-body text-lg text-archive-fg/85">{g}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FORM */}
      <section id="submit-form" className="py-14 bg-paper grain">
        <div className="mx-auto max-w-[700px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— SEND US YOUR WORK —</p>
          <h2 className="font-heading text-4xl mb-6">Submission form</h2>
          {done ? (
            <div className="bg-paper-deep border border-burgundy p-8 text-center">
              <Check size={40} className="text-burgundy mx-auto" />
              <p className="font-heading text-3xl mt-4">Thank you.</p>
              <p className="font-body text-ink-soft mt-2">Your work is on its way to the editors. We read everything. We'll be in touch.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4">BACK TO CĂLIMARA <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your name *" value={form.submitter_name} onChange={(v) => setForm({ ...form, submitter_name: v })} required />
                <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <Field label="Age (optional)" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
                <Field label="School (optional)" value={form.school} onChange={(v) => setForm({ ...form, school: v })} />
              </div>
              <div>
                <label className="label-mono text-ink-soft block mb-1.5">Type of work *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full bg-paper-deep border border-ink/20 px-3 py-2.5 font-ui focus-ring">
                  <option value="">— choose —</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Field label="Title of the work *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <div>
                <label className="label-mono text-ink-soft block mb-1.5">Short description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-paper-deep border border-ink/20 px-3 py-2.5 font-body focus-ring" />
              </div>
              <div>
                <label className="label-mono text-ink-soft block mb-1.5">Attach your work (file)</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm font-ui" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Portfolio link (optional)" value={form.portfolio_link} onChange={(v) => setForm({ ...form, portfolio_link: v })} />
                <Field label="Instagram (optional)" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
              </div>
              <div>
                <label className="label-mono text-ink-soft block mb-1.5">A note to the editors (optional)</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full bg-paper-deep border border-ink/20 px-3 py-2.5 font-body focus-ring" />
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1" required />
                <span className="font-body text-sm text-ink-soft">I consent to Călimara reviewing this submission for possible publication. My details are kept private and used only for editorial review. (See our privacy notice below.)</span>
              </label>
              <p className="font-mono-c text-[0.65rem] text-ink-soft/70 border border-ink/15 p-3 bg-paper-deep">PRIVACY · Your name, email and work are visible only to Călimara editors. Nothing is shared publicly or with third parties. You may request removal at any time.</p>
              <button type="submit" disabled={submitting || !form.consent} className="w-full bg-ink text-paper py-3.5 hover:bg-burgundy transition-colors focus-ring inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <span className="label-mono">SENDING…</span> : <><Send size={16} /><span className="label-mono">SEND YOUR WORK</span></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* cross-link to Join */}
      <section className="bg-paper-deep py-12 grain-light">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-10 text-center">
          <p className="font-heading italic text-2xl">Want to do more than submit?</p>
          <Link to="/join" className="mt-4 inline-flex items-center gap-2 label-mono text-burgundy hover:text-ink focus-ring underline underline-offset-4">JOIN THE CĂLIMARA TEAM <ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="label-mono text-ink-soft block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-paper-deep border border-ink/20 px-3 py-2.5 font-ui focus-ring" />
    </div>
  );
}