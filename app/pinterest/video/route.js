export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return Response.json({ error: "No URL provided" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
    });
    const html = await res.text();

    // Regex to grab the MP4 link from the page source
    const mp4Match = html.match(/https:\/\/v\.pinimg\.com\/[^\s"\\]+\.mp4/);
    
    if (!mp4Match) throw new Error("No video found. This might be an image pin.");

    return Response.json({ url: mp4Match[0].replace(/\\u002F/g, "/") });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
