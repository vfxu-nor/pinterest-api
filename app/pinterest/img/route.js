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

  const origMatch = html.match(
    /https:\/\/i\.pinimg\.com\/originals\/[a-f0-9/]+\.[a-z]+/
  );
  if (origMatch) return origMatch[0];

  const $ = load(html);
  const og = $('meta[property="og:image"]').attr("content");
  if (og) return og.replace(/\/\d+x\//, "/originals/");

  throw new Error("Could not find image in this pin.");
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
    return Response.json({ error: e.message }, { status: 500 });
  }
}
