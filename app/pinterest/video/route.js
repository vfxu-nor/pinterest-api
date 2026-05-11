const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

async function extractVideo(pinUrl) {
  const res = await fetch(pinUrl, { headers: HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`Pinterest returned ${res.status}`);
  const html = await res.text();

  const mp4 = html.match(/https:\/\/v\.pinimg\.com\/[^\s"\\]+\.mp4[^\s"\\]*/);
  if (mp4) return mp4[0].replace(/\\u002F/g, "/");

  const v720 = html.match(/https:\/\/v\.pinimg\.com\/videos\/[^\s"\\]+/);
  if (v720) return v720[0].replace(/\\u002F/g, "/");

  throw new Error(
    "No video found in this pin. Make sure it's a video pin URL."
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Missing ?url= parameter" }, { status: 400 });
  }

  try {
    const videoUrl = await extractVideo(url);
    return Response.json({ url: videoUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
