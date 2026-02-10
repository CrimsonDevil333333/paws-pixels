import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "cute animals";
  const sig = Date.now();

  try {
    const response = await fetch(`http://localhost:8090/search?q=${encodeURIComponent(q)}&format=json&categories=images`);
    const data = await response.json();
    
    // Filter and map results, forcing HD params and adding unique signatures for freshness
    const results = (data.results || [])
      .filter((r: any) => r.img_src && r.img_src.trim() !== "")
      .map((r: any, i: number) => {
        let hdUrl = r.img_src;
        if (hdUrl.includes("unsplash.com")) {
          // Force high-res Unsplash params
          hdUrl = hdUrl.replace(/w=\d+/, 'w=1080').replace(/q=\d+/, 'q=80');
          hdUrl += hdUrl.includes('?') ? `&sig=${sig}-${i}` : `?sig=${sig}-${i}`;
        }
        
        return {
          id: `live-${sig}-${i}`,
          name: r.title || "Cute Friend",
          image: hdUrl,
          color: "bg-slate-100",
          darkColor: "bg-slate-900/30",
          tags: [q]
        };
      });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" });
  }
}
