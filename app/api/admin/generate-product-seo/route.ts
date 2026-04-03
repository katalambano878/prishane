import { NextResponse } from 'next/server';

/**
 * POST /api/admin/generate-product-seo
 * Body: { name: string, description?: string }
 * Returns: { seoTitle: string, metaDescription: string, keywords: string }
 * Requires: OPENAI_API_KEY in .env
 */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured. Add it in .env to use AI-generated SEO.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    const prompt = `You are an SEO copywriter for an e-commerce store. Given a product name and optional description, return exactly three short texts, optimized for search engines.

Product name: ${name}
${description ? `Product description: ${description.slice(0, 1500)}` : ''}

Respond with a JSON object only (no markdown, no code block), with these exact keys:
- "seoTitle": Page title, under 60 characters, include main keyword.
- "metaDescription": Meta description, 150-160 characters, compelling and keyword-rich.
- "keywords": Comma-separated list of 5-10 relevant keywords/phrases (e.g. "human hair wig, bob wig, straight hair").`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You output only valid JSON with keys seoTitle, metaDescription, keywords. No other text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[generate-product-seo] OpenAI error:', res.status, err);
      return NextResponse.json(
        { error: 'AI service error. Check OPENAI_API_KEY and try again.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI.' }, { status: 502 });
    }

    // Parse JSON (strip possible markdown code fence)
    let json: { seoTitle?: string; metaDescription?: string; keywords?: string };
    try {
      const raw = content.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid AI response format.' }, { status: 502 });
    }

    const seoTitle = typeof json.seoTitle === 'string' ? json.seoTitle.slice(0, 70) : name;
    const metaDescription = typeof json.metaDescription === 'string' ? json.metaDescription.slice(0, 500) : '';
    const keywords = typeof json.keywords === 'string' ? json.keywords : (Array.isArray(json.keywords) ? (json.keywords as string[]).join(', ') : '');

    return NextResponse.json({ seoTitle, metaDescription, keywords });
  } catch (e) {
    console.error('[generate-product-seo]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
