import React, { useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';

export default function ArtifactPagePicker({ story, issue, onClose, onSaved }) {
  const initial = useMemo(() => story.artifact_page_numbers?.length ? story.artifact_page_numbers :
    (story.artifact_pages || []).map((url) => (issue?.page_images || []).indexOf(url) + 1).filter(Boolean), [story, issue]);
  const [selected, setSelected] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pages = issue?.page_images || [];
  const toggle = (number) => setSelected((current) => current.includes(number) ? current.filter((n) => n !== number) : [...current, number]);
  const save = async () => {
    setSaving(true); setError('');
    try {
      const numbers = [...selected].sort((a, b) => a - b);
      const artifact_pages = numbers.map((n) => pages[n - 1]).filter(Boolean);
      const updated = await base44.entities.Story.update(story.id, { artifact_pages, artifact_page_numbers: numbers, artifact_start_page: numbers[0] || story.page_number });
      onSaved(updated);
    } catch { setError('Could not save the selected pages.'); setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 bg-archive-bg/90 p-4 md:p-8 flex items-center justify-center">
    <div className="bg-paper w-full max-w-5xl max-h-full flex flex-col border-2 border-ink shadow-2xl">
      <header className="p-4 border-b border-ink/20 flex items-center justify-between gap-4"><div><p className="label-mono text-burgundy">SELECT ORIGINAL PAGES</p><h2 className="font-heading text-2xl">{story.title}</h2></div><button onClick={onClose} className="focus-ring"><X /></button></header>
      <div className="overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">{pages.map((src, index) => { const number = index + 1; const active = selected.includes(number); return <button key={number} disabled={!src} onClick={() => toggle(number)} className={`relative aspect-[210/297] border-2 focus-ring ${active ? 'border-burgundy' : 'border-ink/15'} disabled:opacity-30`}><Image src={src} alt={`Magazine scan ${number}`} fittingType="fit" className="w-full h-full bg-paper-deep"/><span className="absolute bottom-1 left-1 label-mono bg-paper px-1">{number}</span>{active && <Check className="absolute top-1 right-1 bg-burgundy text-paper p-1" size={24}/>}</button>; })}</div>
      <footer className="p-4 border-t border-ink/20 flex items-center justify-between gap-4"><p className="label-mono text-ink-soft">{error || `${selected.length} PAGE${selected.length === 1 ? '' : 'S'} SELECTED`}</p><button onClick={save} disabled={saving} className="label-mono bg-burgundy text-paper px-5 py-3 focus-ring disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16}/> : 'SAVE PAGES'}</button></footer>
    </div>
  </div>;
}