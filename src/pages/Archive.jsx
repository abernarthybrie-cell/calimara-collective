import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/api/client';
import IssueFolder from '@/components/IssueFolder';
import Stamp from '@/components/Stamp';

// per-folder rhythm — height (px), overlap with the next (px), left offset (%), width (%), rotation (deg)
const FOLDER_RHYTHM = [
  { h: 350, ov: 210, left: 2,  w: 86, rot: -0.5 },
  { h: 350, ov: 206, left: 12, w: 88, rot: 0.45 },
  { h: 350, ov: 208, left: -1, w: 91, rot: -0.35 },
  { h: 350, ov: 0,   left: 8,  w: 90, rot: 0.3 }
];

// clutter tucked between folders — type, left (%), width (px), rotation, tuck (behind next or in front)
const CLUTTER_RHYTHM = [
  { type: 'photo', left: 70, w: 110, rot: 4,   behind: false },
  { type: 'note',  left: 2,  w: 150, rot: -3,  behind: true },
  { type: 'photo', left: 60, w: 120, rot: 6,   behind: false },
  { type: 'scrap', left: 15, w: 120, rot: 2,   behind: true },
  { type: 'photo', left: 73, w: 100, rot: -4,  behind: false },
  { type: 'note',  left: 5,  w: 140, rot: 3,   behind: true }
];

export default function Archive() {
  const [issues, setIssues] = useState([]);
  const [stories, setStories] = useState([]);
  const [illus, setIllus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.entities.Issue.filter({ status: 'published' }, 'number', 100),
      db.entities.Story.list(400),
      db.entities.Illustration.list(400)
    ]).then(([iss, st, il]) => {
      setIssues(iss);
      setStories(st);
      setIllus(il);
    }).finally(() => setLoading(false));
  }, []);

  const storiesFor = (slug) => stories.filter((s) => s.issue_slug === slug);
  const illusFor = (slug) => illus.filter((i) => i.issue_slug === slug);

  const { folders, clutter, totalHeight } = useMemo(() => {
    const n = issues.length;
    const folders = [];
    let t = 0;
    for (let i = 0; i < n; i++) {
      const cfg = FOLDER_RHYTHM[i % FOLDER_RHYTHM.length];
      const isLast = i === n - 1;
      folders.push({ top: t, left: cfg.left, width: cfg.w, height: cfg.h, rotate: cfg.rot, z: i + 1 });
      t += cfg.h - (isLast ? 0 : cfg.ov);
    }
    const clutter = [];
    for (let i = 0; i < n - 1; i++) {
      const c = CLUTTER_RHYTHM[i % CLUTTER_RHYTHM.length];
      const folderBelow = folders[i + 1];
      clutter.push({
        type: c.type,
        top: folders[i].top + folders[i].height - 34,
        left: c.left,
        w: c.w,
        rot: c.rot,
        z: c.behind ? folderBelow.z - 0.5 : folderBelow.z + 0.5
      });
    }
    return { folders, clutter, totalHeight: t };
  }, [issues]);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-archive-bg text-archive-fg grain">
      {/* minimal header — let the pile speak */}
      <section className="pt-16 pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-mono text-dusty-yellow mb-2">— A PILE OF FOLDERS —</p>
              <h1 className="font-heading text-5xl md:text-7xl">ARCHIVE</h1>
            </div>
            <Stamp className="text-dusty-yellow">{issues.length} ISSUES · FILED</Stamp>
          </div>
        </div>
      </section>

      {/* the pile — one continuous layered composition */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          {loading && <p className="label-mono text-archive-muted">opening the folders…</p>}
          {!loading && issues.length === 0 && (
            <p className="font-hand text-2xl text-archive-fg/70">No issues filed yet. The first folder will appear here.</p>
          )}

          {!loading && issues.length > 0 && (
            <div className="relative" style={{ height: totalHeight }}>
              {/* the folders — each contains its own layered physical ephemera */}
              {issues.map((it, i) => (
                <IssueFolder
                  key={it.id}
                  issue={it}
                  stories={storiesFor(it.slug)}
                  illustrations={illusFor(it.slug)}
                  layout={folders[i]}
                  polaroid={i === 0 || i === issues.length - 1}
                  isLast={i === issues.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ClutterFragment({ type, top, left, w, rot, z }) {
  const inner = {
    photo: (
      <div className="bg-white p-1.5 pb-5 shadow-lg">
        <div className="aspect-[3/4] w-full scan-placeholder" />
        <p className="font-hand text-xs mt-1 text-center text-ink-soft">—</p>
      </div>
    ),
    note: (
      <div className="bg-[#fdfaf2] p-3 shadow-md border border-ink/15">
        <p className="font-hand text-base leading-snug text-ink">a note from the archive</p>
      </div>
    ),
    tape: (
      <div className="h-7 w-full tape" />
    ),
    scrap: (
      <div className="bg-paper p-2 shadow-md border border-ink/10">
        <p className="label-mono text-[0.55rem] text-burgundy">FRAGMENT</p>
        <p className="font-mono-c text-[0.6rem] text-ink-soft mt-1">cat. călimara</p>
      </div>
    )
  }[type];

  return (
    <div
      className="fragment"
      style={{ position: 'absolute', top, left: `${left}%`, width: w, zIndex: z, '--rot': `${rot}deg` }}
    >
      {inner}
    </div>
  );
}