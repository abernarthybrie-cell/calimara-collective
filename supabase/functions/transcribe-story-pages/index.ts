// Port of base44/functions/transcribeStoryPages.
// Admin-only. Reads magazine page scans via OpenAI vision and writes story.full_text.
//
// Secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
//   OPENAI_API_KEY   required
//   OPENAI_MODEL     optional, default gpt-4o
//
// Deploy:  npx supabase functions deploy transcribe-story-pages --project-ref hkvrkekzdabjkbwrdesw
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT = (title: string) =>
  `Extract only the body text of the magazine work titled "${title}" from these pages. The extracted body must clearly match the title's subject; never substitute a neighboring article. The exact catalogue title may be absent, but the body itself must concern the same subject. If no matching body is visible, return exactly NO_MATCH. Exclude the title itself, author/byline, page numbers, headers, captions, pull quotes, advertisements, credits, labels, and unrelated text. Preserve the body wording exactly, including original spelling, capitalization, punctuation, diacritics, and language. Do not translate, summarize, correct, explain, or add markdown. For prose, return unformatted plain text only. If the work is a poem, preserve its original line breaks and stanza breaks. Return only the matching body text, in reading order.`;

// Keep in sync with pageRange.js (self-checked under node).
function pageRange(
  storyPage: number,
  nextStoryPage: number | null,
  issuePageCount: number,
  startOverride?: number,
  endOverride?: number,
) {
  const catalogueStart = Number(storyPage);
  const startPage = Number.isInteger(startOverride) ? (startOverride as number) : catalogueStart;
  const catalogueEnd = nextStoryPage != null ? Number(nextStoryPage) - 1 : issuePageCount;
  const endPage = Number.isInteger(endOverride)
    ? (endOverride as number)
    : Math.min(catalogueEnd, startPage + 5);
  if (startPage < 1 || endPage < startPage || endPage - startPage > 5) {
    return { error: 'Page range must contain 1 to 6 pages' as const };
  }
  return { startPage, endPage };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) return json({ error: 'OPENAI_API_KEY is not configured' }, 500);

    // Caller identity under RLS.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await userClient.from('profile').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const body = await req.json();
    const { storyId, startPageOverride, endPageOverride } = body ?? {};
    if (typeof storyId !== 'string' || !storyId) return json({ error: 'storyId is required' }, 400);

    // Service role for the catalogue read + write (same privilege the Base44 service role had).
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: story, error: storyError } = await admin.from('story').select('*').eq('id', storyId).maybeSingle();
    if (storyError) throw storyError;
    if (!story?.page_number) return json({ error: 'Story page is missing' }, 400);

    const { data: issues } = await admin
      .from('issue')
      .select('*')
      .eq('number', story.issue_number)
      .eq('status', 'published')
      .limit(1);
    const issue = issues?.[0];
    if (!issue) return json({ error: 'Published issue not found' }, 404);

    const { data: issueStories } = await admin
      .from('story')
      .select('page_number')
      .eq('issue_number', story.issue_number)
      .order('page_number', { ascending: true })
      .limit(500);

    const nextStory = (issueStories || []).find((item) => Number(item.page_number) > Number(story.page_number));
    const range = pageRange(
      Number(story.page_number),
      nextStory ? Number(nextStory.page_number) : null,
      (issue.page_images || []).length,
      Number.isInteger(startPageOverride) ? startPageOverride : undefined,
      Number.isInteger(endPageOverride) ? endPageOverride : undefined,
    );
    if ('error' in range) return json({ error: range.error }, 400);

    const { startPage, endPage } = range;
    const pageImages = (issue.page_images || []).slice(startPage - 1, endPage).filter(Boolean);
    if (!pageImages.length) return json({ error: 'No page scans available', startPage, endPage }, 400);

    const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o';
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT(story.title || '') },
            ...pageImages.map((image: string) => ({
              type: 'image_url',
              image_url: { url: image },
            })),
          ],
        }],
      }),
    });
    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      return json({ error: `OpenAI error: ${detail.slice(0, 300)}` }, 502);
    }
    const openaiJson = await openaiRes.json();
    const transcription = String(openaiJson.choices?.[0]?.message?.content || '').trim();
    const refusal = /(?:^NO_MATCH$|requested (?:work|text) (?:was not found|does not appear)|i am sorry)/i.test(transcription);
    if (!transcription || refusal) return json({ error: 'No matching body text was extracted' }, 422);

    const { error: updateError } = await admin
      .from('story')
      .update({ full_text: transcription })
      .eq('id', story.id);
    if (updateError) throw updateError;

    return json({
      storyId: story.id,
      title: story.title,
      startPage,
      endPage,
      pageCount: pageImages.length,
      characterCount: transcription.length,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
