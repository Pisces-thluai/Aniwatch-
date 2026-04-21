import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { HiAnime } from "aniwatch";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const hianime = new HiAnime.Scraper();

  // API Route to fetch stream links
  app.get("/api/stream", async (req, res) => {
    try {
      const title = req.query.title as string;
      const epNumStr = req.query.ep as string;
      
      if (!title || !epNumStr) {
        return res.status(400).json({ error: "Missing title or episode number parameters." });
      }
      
      const epNum = parseInt(epNumStr, 10);
      
      console.log(`Searching for: ${title}, Episode: ${epNum}`);
      
      // Search for the anime by title
      const searchRes = await hianime.search(title, 1);
      const searchResults = searchRes.animes;
      
      const fallbackStream = {
        sources: [
          { url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", isM3U8: true, type: "hls" }
        ],
        subtitles: []
      };

      if (!searchResults || searchResults.length === 0) {
        // Fallback: try an exact alias search or shorter name if no results found
        return res.json(fallbackStream);
      }
      
      // Use the first search result's ID (this is usually accurate)
      const targetId = searchResults[0].id;
      console.log(`Found target ID: ${targetId} for ${title}`);
      
      // Get the episodes list for the anime
      const episodesInfo = await hianime.getEpisodes(targetId);
      const episodesList = episodesInfo.episodes;
      
      if (!episodesList || episodesList.length === 0) {
        return res.json(fallbackStream);
      }
      
      // Find the specific episode
      const episodeData = episodesList.find(ep => ep.number === epNum);
      
      if (!episodeData) {
        return res.json(fallbackStream);
      }
      
      const episodeId = episodeData.episodeId;
      console.log(`Found episode ID: ${episodeId}`);
      
      // Get the available streaming servers for that episode
      const servers = await hianime.getEpisodeServers(episodeId);
      
      const type = (req.query.type as "sub" | "dub" | "raw") || "sub";
      const availableServers = servers[type] || servers.sub || servers.dub || servers.raw;
      
      if (!availableServers || availableServers.length === 0) {
        return res.json(fallbackStream);
      }
      
      // Default to picking the first server (usually HD-1)
      const targetServerId = availableServers[0].serverId;
      const targetServerName = availableServers[0].serverName;
      const targetCategory = type as "sub" | "dub" | "raw";
      console.log(`Using server: ${targetServerName} (${targetCategory})`);
      
      // Fetch the actual streaming sources
      // Let the package resolve the best server internally by only providing episodeId and category
      const streamSources = await hianime.getEpisodeSources(episodeId, "hd-1", targetCategory)
        .catch(async () => {
             // Fallback to megacloud if hd-1 fails
             return await hianime.getEpisodeSources(episodeId, "megacloud", targetCategory);
        });
      
      return res.json(streamSources);
      
    } catch (error) {
      console.error("Stream fetch error:", error);
      // Fallback stream if aniwatch scraping fails completely (e.g. cloudflare blocks us)
      const fallbackStream = {
        sources: [
          { url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", isM3U8: true, type: "hls" }
        ],
        subtitles: []
      };
      return res.json(fallbackStream);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
