import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, Trash2 } from 'lucide-react';

export default function Chat() {
  const { user } = useOutletContext() || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const name = user?.full_name || (user?.email ? user.email.split('@')[0] : 'member');

  useEffect(() => {
    base44.entities.MemberMessage.list('-created_date', 200)
      .then((rows) => setMessages([...rows].reverse()))
      .catch(() => {});
    const unsub = base44.entities.MemberMessage.subscribe((event) => {
      if (event.type === 'create') setMessages((prev) => [...prev, event.data].slice(-300));
      if (event.type === 'delete') setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
    });
    return unsub;
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await base44.entities.MemberMessage.create({ text: text.trim(), author_name: name, author_id: user?.id });
      setText('');
    } catch {} finally { setSending(false); }
  };

  const remove = async (id) => { try { await base44.entities.MemberMessage.delete(id); } catch {} };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] space-y-4">
      <div>
        <p className="label-mono text-dusty-yellow">— TEAM CHAT —</p>
        <h1 className="font-heading text-4xl">The editorial group chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto border border-archive-line bg-archive-bg2 p-4 space-y-3">
        {messages.length === 0 && <p className="font-body text-archive-muted text-center py-10">No messages yet. Say hello to the team.</p>}
        {messages.map((m) => {
          const mine = m.author_id && user?.id && m.author_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${mine ? 'bg-cyanotype/20' : 'bg-archive-bg'} border border-archive-line px-3 py-2`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="label-mono text-dusty-yellow">{m.author_name || 'member'}</p>
                  {isAdmin && <button onClick={() => remove(m.id)} className="text-archive-muted hover:text-faded-red focus-ring" aria-label="Delete message"><Trash2 size={12}/></button>}
                </div>
                <p className="font-body text-archive-fg/90 mt-1 whitespace-pre-line break-words">{m.text}</p>
                <p className="label-mono text-archive-muted text-[0.5rem] mt-1">{m.created_date ? new Date(m.created_date).toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to the team…" className="flex-1 bg-archive-bg2 border border-archive-line px-4 py-3 text-archive-fg focus-ring" />
        <button type="submit" disabled={sending} className="bg-dusty-yellow text-ink px-5 py-3 label-mono hover:bg-cyanotype hover:text-paper focus-ring flex items-center gap-2"><Send size={14}/> SEND</button>
      </form>
    </div>
  );
}