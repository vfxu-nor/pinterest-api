import { load } from "cheerio";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return Response.json({ error: "No URL provided" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
    });
    const html = await res.text();
    const $ = load(html);

    // Look for the hidden JSON data block
    const scriptData = $("script[id='__PWS_DATA__']").html();
    let imageUrl = null;

    if (scriptData) {
      const json = JSON.parse(scriptData);
      const pins = json.props?.initialState?.pins;
      if (pins) {
        const pinId = Object.keys(pins)[0];
        imageUrl = pins[pinId]?.images?.originals?.url;
      }
    }

    // Fallback if the JSON method fails
    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr("content")?.replace(/\/\d+x\//, "/originals/");
    }

    if (!imageUrl) throw new Error("Image not found");

    return Response.json({ url: imageUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
