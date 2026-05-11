// app/api/pin/img/route.js
import { load } from "cheerio";

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return Response.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
    });
    const html = await res.text();
    const $ = load(html);

    // 1. Try the specific meta tag (fastest)
    let img = $('meta[property="og:image"]').attr("content");

    // 2. Try the <img> tag pattern you provided if meta fails
    if (!img) {
      img = $('img[src*="pinimg.com/736x"]').first().attr("src") 
            || $('img[elementtiming="StoryPinImageBlock-MainPinImage"]').attr("src");
    }

    if (!img) throw new Error("Image not found");

    // Force it to the high-res "originals" version
    const highRes = img.replace(/\/\d+x\//, "/originals/").replace(/i\.pinimg\.com\/736x/, "i.pinimg.com/originals");

    return Response.json({ url: highRes });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
