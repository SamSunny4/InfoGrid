import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const NEWSAPI_KEY = process.env.NEWSAPI_KEY as string;
const NEWSAPI_BASE = "https://newsapi.org/v2";

export interface NewsAPIArticle {
  source: { id: string | null; name: string };
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

/**
 * GET /api/admin/fetch-news
 *
 * Query params:
 *   q        — search keyword (default "artificial intelligence")
 *   page     — page number (default 1)
 *   pageSize — results per page (default 12, max 20)
 *
 * Requires an active admin session.
 */
export async function GET(request: Request) {
  // Auth guard
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!NEWSAPI_KEY) {
    return NextResponse.json(
      { error: "NEWSAPI_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q        = searchParams.get("q")        ?? "artificial intelligence";
  const page     = searchParams.get("page")     ?? "1";
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 12), 20).toString();

  const upstream = new URL(`${NEWSAPI_BASE}/everything`);
  upstream.searchParams.set("q",        q);
  upstream.searchParams.set("language", "en");
  upstream.searchParams.set("sortBy",   "publishedAt");
  upstream.searchParams.set("page",     page);
  upstream.searchParams.set("pageSize", pageSize);
  upstream.searchParams.set("apiKey",   NEWSAPI_KEY);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { "User-Agent": "InfoGrid/1.0" },
      // Don't cache — always return fresh news
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: body.message ?? "NewsAPI request failed" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filter out articles with [Removed] titles or null descriptions
    const articles: NewsAPIArticle[] = (data.articles ?? []).filter(
      (a: NewsAPIArticle) =>
        a.title &&
        a.title !== "[Removed]" &&
        a.description &&
        a.description !== "[Removed]"
    );

    return NextResponse.json({ ok: true, totalResults: data.totalResults, articles });
  } catch (err) {
    console.error("[fetch-news]", err);
    return NextResponse.json({ error: "Failed to fetch from NewsAPI" }, { status: 500 });
  }
}
