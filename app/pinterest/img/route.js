import { load } from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

async function extractImage(pinUrl) {
  const res = await fetch(pinUrl, { headers: HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`Pinterest returned ${res.status}`);
  const html = await res.text();
  const $ = load(html);

  // 1. Try finding the "originals" URL in the script tags (most reliable for high res)
  const scriptTag = $("script[id='__PWS_DATA__']").html();
  if (scriptTag) {
    try {
      const json = JSON.parse(scriptTag);
      // Dig through the deep Pinterest state object
      const pins = json.props?.initialState?.pins;
      if (pins) {
        const pinId = Object.keys(pins)[0];
        const images = pins[pinId]?.images;
        const original = images?.originals?.url || images?.["736x"]?.url;
        if (original) return original;
      }
    } catch (e) {
      console.error("Failed to parse Pinterest JSON-LD", e);
    }
  }

  // 2. Fallback: Search raw HTML for any "originals" pattern
  const origMatch = html.match(/https:\/\/i\.pinimg\.com\/originals\/[a-f0-9/]+\.[a-z]+/);
  if (origMatch) return origMatch[0];

  // 3. Fallback: Metadata tags
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) {
    // Attempt to upgrade quality from thumbnails to originals
    return ogImage.replace(/\/\d+x\//, "/originals/").replace(/i\.pinimg\.com\/736x/, "i.pinimg.com/originals");
  }

  throw new Error("Could not find image in this pin. It might be a video or private.");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Missing ?url= parameter" }, { status: 400 });
  }

  try {
    const imgUrl = await extractImage(url);
    return Response.json({ url: imgUrl });
  } catch (e) {
    // Return a proper JSON error so the frontend doesn't crash on JSON.parse
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
