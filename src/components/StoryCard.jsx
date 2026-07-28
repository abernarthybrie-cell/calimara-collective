import React from 'react';
import { Link } from 'react-router-dom';
import Stamp from '@/components/Stamp';

export default function StoryCard({ story, caption }) {
  const issueSlug = story.issue_slug || `issue-${String(story.issue_number || 1).padStart(2, '0')}`;
  const tags = [...(story.mood_tags || []), ...(story.topic_tags || [])].slice(0, 6);
  return (
    <Link
      to={`/archive/issue/${issueSlug}/story/${story.slug}`}
      className="block bg-paper-deep border border-ink/15 p-4 hover:bg-paper-shadow transition-colors group focus-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="label-mono text-ink-soft/60">
            ISSUE {String(story.issue_number || '—').padStart(2, '0')} · {story.rubrica || story.form || '—'}
          </p>
          <h3 className="font-heading text-2xl leading-tight group-hover:text-burgundy">{story.title}</h3>
          {story.author_name && <p className="font-hand text-lg text-ink-soft mt-0.5">{story.author_name}</p>}
        </div>
        {story.reading_time_min ? <Stamp className="text-burgundy">{story.reading_time_min} MIN</Stamp> : null}
      </div>
      {story.excerpt && <p className="font-body text-ink-soft text-sm mt-2 line-clamp-3">{story.excerpt}</p>}
      {caption && <p className="font-hand text-base text-burgundy/80 mt-2">{caption}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((t, i) => (
            <span key={i} className="label-mono text-[0.6rem] text-ink-soft/70 border border-ink/15 px-1.5 py-0.5">{t}</span>
          ))}
        </div>
      )}
    </Link>
  );
}