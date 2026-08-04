import React, { useEffect } from 'react';
import { installMadeOfScarsGlyphs } from '@/lib/madeOfScarsGlyphs';

export default function MadeOfScarsGlyphs() {
  useEffect(() => {
    let active = true;
    let remove;
    installMadeOfScarsGlyphs().then((cleanup) => {
      if (active) remove = cleanup;
      else cleanup();
    });
    return () => { active = false; remove?.(); };
  }, []);

  return null;
}