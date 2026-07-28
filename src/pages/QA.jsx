import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/lib/calimara';

export default function QA() {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    base44.entities.FAQItem.list('order', 200)
      .then((r) => setItems(r.filter((x) => x.published !== false)))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const map = {};
    items.forEach((it) => { (map[it.category] = map[it.category] || []).push(it); });
    return map;
  }, [items]);

  const formUrl = settings?.google_form_url || '#';

  return (
    <div className="pt-14 sm:pt-16">
      <section className="bg-paper-deep grain-light pt-14 pb-12">
        <div className="mx-auto max-w-[1000px] px-6 lg:px-10">
          <p className="label-mono text-burgundy mb-3">— BEFORE YOU JOIN —</p>
          <h1 className="font-heading text-6xl md:text-7xl leading-[0.9]">So, you want to join Călimara?</h1>
          <p className="font-heading italic text-xl md:text-2xl text-ink-soft mt-4 max-w-xl leading-snug">Questions, answered like notes pinned to the studio wall.</p>
        </div>
      </section>

      <section className="py-14 bg-paper grain">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10 space-y-10">
          {Object.keys(categories).length === 0 && (
            <p className="font-body text-ink-soft">Questions will appear here once added in the CMS.</p>
          )}
          {Object.entries(categories).map(([cat, list]) => (
            <div key={cat}>
              <p className="label-mono text-burgundy mb-3">— {cat.toUpperCase()} —</p>
              <div className="space-y-3">
                {list.map((it) => {
                  const isOpen = open === it.id;
                  return (
                    <div key={it.id} className="bg-paper-deep border border-ink/15">
                      <button onClick={() => setOpen(isOpen ? null : it.id)} className="w-full text-left flex items-start justify-between gap-4 p-4 focus-ring">
                        <span className="font-heading text-xl leading-snug">{it.question}</span>
                        <span className={`label-mono text-burgundy mt-1 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      {isOpen && <p className="font-body text-ink-soft px-4 pb-4 -mt-1 whitespace-pre-line">{it.answer}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 bg-archive-bg text-archive-fg grain">
        <div className="mx-auto max-w-[900px] px-6 lg:px-10 grid md:grid-cols-2 gap-6">
          <div className="border border-archive-line p-6">
            <p className="label-mono text-dusty-yellow">STILL HAVE A QUESTION?</p>
            <p className="font-heading text-2xl mt-2">Write to us.</p>
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="mt-3 inline-flex items-center gap-2 label-mono text-cyanotype hover:text-dusty-yellow focus-ring"><Mail size={14}/> CONTACT US →</a>
            )}
          </div>
          <div className="border border-archive-line p-6">
            <p className="label-mono text-dusty-yellow">READY TO JOIN?</p>
            <p className="font-heading text-2xl mt-2">The door is open.</p>
            <a href={formUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 label-mono text-dusty-yellow hover:text-paper focus-ring underline underline-offset-4">REGISTER YOUR INTEREST <ArrowRight size={14}/></a>
          </div>
        </div>
      </section>
    </div>
  );
}