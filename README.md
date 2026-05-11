# Pinterest Downloader

## Local dev
npm install
npm run dev

## Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Done — zero config needed

## API
GET /api/pinterest/img?url=<pinterest_url>
GET /api/pinterest/video?url=<pinterest_url>

Both return { url: "..." } or { error: "..." }
