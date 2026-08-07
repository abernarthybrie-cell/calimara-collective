// Page-range logic for the Edge Function, mirrored so node can self-check it.
// Keep in sync with pageRange() in supabase/functions/transcribe-story-pages/index.ts.

export function pageRange(storyPage, nextStoryPage, issuePageCount, startOverride, endOverride) {
  const catalogueStart = Number(storyPage);
  const startPage = Number.isInteger(startOverride) ? startOverride : catalogueStart;
  const catalogueEnd = nextStoryPage != null ? Number(nextStoryPage) - 1 : issuePageCount;
  const endPage = Number.isInteger(endOverride)
    ? endOverride
    : Math.min(catalogueEnd, startPage + 5);
  if (startPage < 1 || endPage < startPage || endPage - startPage > 5) {
    return { error: 'Page range must contain 1 to 6 pages' };
  }
  return { startPage, endPage };
}
