import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import IssueFolder from '@/components/IssueFolder';
import Stamp from '@/components/Stamp';

// per-folder rhythm — body left (%), body width (%), which side the tab sticks out, rotation
const FOLDER_RHYTHM = [
  { left: 8,  width: 78, tabSide: 'right', rot: -1 },
  { left: 2,  width: 70, tabSide: 'left',  rot: 1.5 },
  { left: 18, width: 74, tabSide: 'right', rot: -1 },
  { left: 4,  width: 68, tabSide: 'left',  rot: 1 },
  { left: 14, width: 76, tabSide: 'right', rot: -1.5 },
  { left: 3,  width: 70, tabSide: 'left',  rot: 1 }
];

const STEP = 64;     // vertical cascade between folders (px)
const BODY_H = 240;  // folder body height (px)
const TAB_H = 56;    // tab height (px)

// loose photos tucked between folders — left (%), width (px), rotation, vertical anchor (fraction of body)
const CLUTTER_RHYTHM = [
  { left: 62, w: 130, rot: 4,  anchor: 0.5 },
  { left: 0,  w: 120, rot: -5, anchor: 0.55 },
  { left: 66, w: 110, rot: 6,  anchor: 0.45 },
  { left: -1, w: 125, rot: -3, anchor: 0.5 }
];

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

  const { folders, clutter, totalHeight } = useMemo(() => {
    const n = issues.length;
    const folders = issues.map((_, i) => {
      const cfg = FOLDER_RHYTHM[i % FOLDER_RHYTHM.length];
      return {
        top: 12 + i * STEP,
        left: cfg.left,
        width: cfg.width,
        height: BODY_H,
        rotate: cfg.rot,
        z: n - i,
        tabSide: cfg.tabSide
      };
    });
    const clutter = [];
    for (let i = 0; i < n - 1; i++) {
      const c = CLUTTER_RHYTHM[i % CLUTTER_RHYTHM.length];
      clutter.push({
        top: folders[i].top + BODY_H * c.anchor - 30,
        left: c.left,
        w: c.w,
        rot: c.rot,
        z: folders[i + 1].z + 0.5
      });
    }
    const totalHeight = 12 + (n - 1) * STEP + TAB_H + BODY_H + 16;
    return { folders, clutter, totalHeight };
  }, [issues]);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-archive-bg text-archive-fg grain">
      <section className="pt-16 pb-6">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-mono text-dusty-yellow mb-2">— A PILE OF FOLDERS —</p>
              <h1 className="font-heading text-5xl md:text-7xl">Archive</h1>
            </div>
            <Stamp className="text-dusty-yellow">{issues.length} ISSUES · PILED</Stamp>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          {loading && <p className="label-mono text-archive-muted">opening the folders…</p>}
          {!loading && issues.length === 0 && (
            <p className="font-hand text-2xl text-archive-fg/70">No issues filed yet. The first folder will appear here.</p>
          )}

          {!loading && issues.length > 0 && (
            <div className="relative" style={{ height: totalHeight }}>
              {clutter.map((c, i) => (
                <ClutterPhoto key={`c-${i}`} {...c} />
              ))}
              {issues.map((it, i) => (
                <IssueFolder
                  key={it.id}
                  issue={it}
                  stories={storiesFor(it.slug)}
                  illustrations={illusFor(it.slug)}
                  layout={folders[i]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ClutterPhoto({ top, left, w, rot, z }) {
  return (
    <div
      className="fragment"
      style={{ position: 'absolute', top, left: `${left}%`, width: w, zIndex: z, '--rot': `${rot}deg` }}
    >
      <div className="shadow-lg">
        <div className="aspect-[3/4] w-full scan-placeholder" />
      </div>
    </div>
  );
}