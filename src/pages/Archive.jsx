import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import IssueFolder from '@/components/IssueFolder';
import Stamp from '@/components/Stamp';

export default function Archive() {
  const [issues, setIssues] = useState([]);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Issue.filter({ status: 'published' }, 'number', 100),
      base44.entities.Story.list(400),
      base44.entities.Illustration.list(400)
    ]).then(([iss, st, il]) => {
      setIssues(iss);
      setStories(st);
      setIllus(il);
    }).finally(() => setLoading(false));
  }, []);

  const storiesFor = (slug) => stories.filter((s) => s.issue_slug === slug);
  const illusFor = (slug) => illus.filter((i) => i.issue_slug === slug);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-archive-bg text-archive-fg grain">
      {/* minimal header — let the folders speak */}
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-mono text-dusty-yellow mb-2">— ISSUES INTO FOLDERS —</p>
              <h1 className="font-heading text-5xl md:text-7xl">Archive</h1>
            </div>
            <Stamp className="text-dusty-yellow">{issues.length} ISSUES · CATALOGUED</Stamp>
          </div>
        </div>
      </section>

      {/* the filing cabinet — layered folders */}
      <section className="pb-28">
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          {loading && <p className="label-mono text-archive-muted px-2">opening the folders…</p>}
          {!loading && issues.length === 0 && (
            <p className="font-hand text-2xl text-archive-fg/70 px-2">No issues filed yet. The first folder will appear here.</p>
          )}

          <div className="space-y-10 md:space-y-14">
            {issues.map((it, i) => (
              <div
                key={it.id}
                className="max-w-[1080px]"
                style={{ marginLeft: i % 2 ? 'auto' : undefined, marginRight: i % 2 ? undefined : 'auto' }}
              >
                <IssueFolder issue={it} stories={storiesFor(it.slug)} illustrations={illusFor(it.slug)} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}