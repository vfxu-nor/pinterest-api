// app/api/pin/video/route.js
export async function GET(req) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return Response.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
    });
    const html = await res.text();

    // Instead of looking for <video> (which shows a blob), 
    // we grab the actual MP4 URL from the script data.
    const videoMatch = html.match(/https:\/\/v1\.pinimg\.com\/[^\s"\\]+\.mp4/) 
                    || html.match(/https:\/\/v\.pinimg\.com\/[^\s"\\]+\.mp4/);

    if (!videoMatch) throw new Error("No video found at this URL");

    // Clean up any escaped slashes from the HTML source
    const cleanUrl = videoMatch[0].replace(/\\u002F/g, "/");

    return Response.json({ url: cleanUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
