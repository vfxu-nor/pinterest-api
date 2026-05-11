"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("img"); // "img" or "video"

  async function handle() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(
        `/api/pinterest/${mode}?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      background: "#0e0e0e", minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", color: "#e8e8e8", padding: 24
    }}>
      <h1 style={{ fontSize: "1.3rem", letterSpacing: "0.15em", marginBottom: 32, textTransform: "uppercase" }}>
        <span style={{ color: "#e60023" }}>//</span> Pinterest Downloader
      </h1>

      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["img", "video"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? "#e60023" : "#1a1a1a",
              border: "1px solid #333", color: "#fff",
              fontFamily: "'Courier New', monospace", fontSize: "0.8rem",
              letterSpacing: "0.1em", padding: "8px 18px",
              textTransform: "uppercase", cursor: "pointer"
            }}>{m === "img" ? "Image" : "Video"}</button>
          ))}
        </div>

        {/* input */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="Paste Pinterest URL..."
            style={{
              flex: 1, background: "#1a1a1a", border: "1px solid #333",
              color: "#e8e8e8", fontFamily: "'Courier New', monospace",
              fontSize: "0.9rem", padding: "12px 14px", outline: "none"
            }}
          />
          <button onClick={handle} disabled={loading} style={{
            background: loading ? "#444" : "#e60023", border: "none",
            color: "#fff", fontFamily: "'Courier New', monospace",
            fontSize: "0.85rem", letterSpacing: "0.1em",
            padding: "12px 20px", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer"
          }}>{loading ? "..." : "Fetch"}</button>
        </div>

        {/* error */}
        {error && <p style={{ color: "#e60023", fontSize: "0.8rem", marginTop: 12 }}>{error}</p>}

        {/* result */}
        {result && (
          <div style={{ marginTop: 24 }}>
            {mode === "img"
              ? <img src={result} alt="Pinterest" style={{ width: "100%", maxHeight: 480, objectFit: "contain", background: "#1a1a1a", display: "block" }} />
              : <video src={result} controls style={{ width: "100%", maxHeight: 480, background: "#1a1a1a", display: "block" }} />
            }
            <a href={result} download target="_blank" rel="noreferrer" style={{
              display: "block", marginTop: 10, textAlign: "center",
              background: "#1a1a1a", border: "1px solid #333",
              color: "#e8e8e8", fontFamily: "'Courier New', monospace",
              fontSize: "0.85rem", letterSpacing: "0.1em", padding: 12,
              textDecoration: "none", textTransform: "uppercase"
            }}>Download</a>
          </div>
        )}
      </div>
    </main>
  );
}
