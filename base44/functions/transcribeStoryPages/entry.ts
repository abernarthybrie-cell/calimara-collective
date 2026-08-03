import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateText } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { storyId } = await req.json();
    if (typeof storyId !== 'string' || !storyId) {
      return Response.json({ error: 'storyId is required' }, { status: 400 });
    }

    const story = await base44.asServiceRole.entities.Story.get(storyId);
    if (!story?.page_number) return Response.json({ error: 'Story page is missing' }, { status: 400 });

    const issues = await base44.asServiceRole.entities.Issue.filter({ number: story.issue_number, status: 'published' });
    const issue = issues[0];
    if (!issue) return Response.json({ error: 'Published issue not found' }, { status: 404 });

    const issueStories = await base44.asServiceRole.entities.Story.filter({ issue_number: story.issue_number }, 'page_number', 500);
    const nextStory = issueStories.find((item) => Number(item.page_number) > Number(story.page_number));
    const startPage = Number(story.page_number);
    const endPage = Math.min(nextStory ? Number(nextStory.page_number) - 1 : issue.page_images.length, startPage + 5);
    const pageImages = (issue.page_images || []).slice(startPage - 1, endPage).filter(Boolean);

    if (!pageImages.length) return Response.json({ error: 'No page scans available', startPage, endPage }, { status: 400 });

    const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
    const models = createOpenAICompatible({ name: 'base44', baseURL, apiKey: token, supportsStructuredOutputs: true });
    const content = [
      {
        type: 'text',
        text: `Transcribe the complete text of the following consecutive magazine pages for the story titled "${story.title}". Preserve the printed wording exactly, including original spelling, capitalization, punctuation, diacritics, paragraph breaks, headings, bylines, captions, and language. Do not translate, summarize, correct, explain, or add markdown. Omit only repeated running page numbers and purely decorative marks. Return only the transcription, in page order.`
      },
      ...pageImages.map((image) => ({ type: 'image', image }))
    ];
    const { text } = await generateText({ model: models('automatic'), messages: [{ role: 'user', content }] });
    const transcription = text.trim();
    if (!transcription) return Response.json({ error: 'No text was extracted' }, { status: 422 });

    await base44.asServiceRole.entities.Story.update(story.id, { full_text: transcription });
    return Response.json({ storyId: story.id, title: story.title, startPage, endPage, pageCount: pageImages.length, characterCount: transcription.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}