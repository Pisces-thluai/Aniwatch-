import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Settings, Maximize, Volume2, SkipForward, MessageSquare, Star, Loader2 } from 'lucide-react';
import AnimeCard from '../components/ui/AnimeCard';
import { fetchAnimeById, fetchRecommendations } from '../services/jikanApi';
import { Anime } from '../types';
import StreamPlayer from '../components/ui/StreamPlayer';

export default function Watch() {
  const { id } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedAnime, setRecommendedAnime] = useState<Anime[]>([]);

  const [activeEp, setActiveEp] = useState(1);
  const [activeServer, setActiveServer] = useState('VidStreaming');
  const [serverType, setServerType] = useState<'sub' | 'dub'>('sub');
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [volume, setVolume] = useState(100);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Stream state
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);

  const qualities = ['1080p', '720p', '480p', '360p'];
  const speeds = ['2x', '1.5x', '1.25x', '1x', '0.75x', '0.5x'];

  // Fetch anime data
  useEffect(() => {
    let mounted = true;
    if (id) {
      setIsLoading(true);
      fetchAnimeById(id).then(data => {
        if (mounted) {
          setAnime(data);
          setIsLoading(false);
        }
      });
      fetchRecommendations(id).then(data => {
        if (mounted) setRecommendedAnime(data);
      });
    }
    return () => { mounted = false; };
  }, [id]);

  // Scroll to top when loading a new anime
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveEp(1);
    setProgress(0);
    setIsPlaying(false);
  }, [id]);

  // Reset progress when episode changes manually
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [activeEp]);

  // Fake video progress and autoplay logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && anime) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            if (isAutoplay && activeEp < anime.episodes) {
              setActiveEp(ep => ep + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          // Adjust progress speed based on selected speed
          const speedMultiplier = parseFloat(speed.replace('x', ''));
          return p + (0.5 * speedMultiplier); // 20 seconds to finish at 1x
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAutoplay, activeEp, anime?.episodes, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          if (!document.fullscreenElement) {
            playerRef.current?.requestFullscreen().catch(err => console.error(err));
          } else {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real stream url
  useEffect(() => {
    if (!anime || !anime.title) return;
    
    let mounted = true;
    setIsStreamLoading(true);
    setStreamError(null);
    setStreamUrl(null);
    
    fetch(`/api/stream?title=${encodeURIComponent(anime.title)}&ep=${activeEp}&type=${serverType}`)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        if (data.error) {
          setStreamError(data.error);
        } else if (data.sources && data.sources.length > 0) {
          // Find the default or best quality source (often the first one or auto)
          setStreamUrl(data.sources[0].url);
        } else {
          setStreamError('No playable sources found.');
        }
        setIsStreamLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        console.error(err);
        setStreamError('Failed to establish connection to streaming server.');
        setIsStreamLoading(false);
      });
      
    return () => { mounted = false; };
  }, [anime, activeEp, serverType]);

  if (isLoading || !anime) {
    return (
      <main className="flex-1 pt-24 pb-12 max-w-[1600px] mx-auto px-4 md:px-6 w-full animate-pulse">
        <div className="h-4 w-64 bg-white/10 rounded mb-6"></div>
        <div className="aspect-video bg-white/5 rounded-xl mb-6 border border-white/5 shadow-xl"></div>
      </main>
    );
  }

  const episodes = Array.from({ length: anime.episodes }, (_, i) => i + 1);
  const servers = ['VidStreaming', 'MegaF', 'StreamSB', 'StreamTape'];

  // Generate mock episode details based on the active episode
  const episodeTitle = `Episode ${activeEp}: ${activeEp === 1 ? 'The Beginning' : 'The Journey Continues'}`;
  const episodeSynopsis = `In this exciting episode of ${anime.title}, our heroes face new challenges and uncover hidden truths. The journey continues as they push past their limits in episode ${activeEp}.`;
  
  // Calculate a fake release date based on the anime's release date + weeks per episode
  const baseDate = new Date(anime.releaseDate || '2023-01-01');
  const episodeDate = new Date(baseDate.getTime() + (activeEp - 1) * 7 * 24 * 60 * 60 * 1000);
  const formattedDate = episodeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Get related anime (excluding current) - Now we only have recommendations from API.
  // We remove relatedAnime to simplify.

  // Mock cast data
  const cast = [
    { character: 'Main Character', actor: 'Voice Actor 1', image: 'https://picsum.photos/seed/char1/100/100' },
    { character: 'Supporting Role', actor: 'Voice Actor 2', image: 'https://picsum.photos/seed/char2/100/100' },
    { character: 'Villain', actor: 'Voice Actor 3', image: 'https://picsum.photos/seed/char3/100/100' },
    { character: 'Sidekick', actor: 'Voice Actor 4', image: 'https://picsum.photos/seed/char4/100/100' },
    { character: 'Mentor', actor: 'Voice Actor 5', image: 'https://picsum.photos/seed/char5/100/100' },
    { character: 'Rival', actor: 'Voice Actor 6', image: 'https://picsum.photos/seed/char6/100/100' },
  ];

  return (
    <main className="flex-1 pt-24 pb-12 max-w-[1600px] mx-auto px-4 md:px-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#A0A5B1] mb-6">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white">{anime.title}</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Player & Info */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Player Container */}
          <div className="bg-surface rounded-xl overflow-hidden border border-white/5 shadow-xl relative" ref={playerRef}>
            {isStreamLoading ? (
              <div className="aspect-video bg-black flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-[#A0A5B1] font-medium text-sm animate-pulse">Scraping servers for {anime.title} Episode {activeEp}...</p>
              </div>
            ) : streamError ? (
              <div className="aspect-video bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="text-red-500 mb-2 font-bold text-xl">Stream Unavailable</div>
                <p className="text-[#A0A5B1] mb-6 text-sm">{streamError}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveEp(activeEp > 1 ? activeEp - 1 : 1)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Previous Episode
                  </button>
                  <button 
                    onClick={() => setActiveEp(activeEp < anime.episodes ? activeEp + 1 : anime.episodes)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Next Episode
                  </button>
                </div>
              </div>
            ) : streamUrl ? (
              <div className="aspect-video relative group">
                 <StreamPlayer url={streamUrl} poster={anime.banner || anime.image} />
              </div>
            ) : (
              <div className="aspect-video bg-black flex flex-col items-center justify-center text-white">
                 <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              </div>
            )}

            {/* Server Selection Header */}
            <div className="p-4 bg-[#111216] flex flex-col md:flex-row gap-4 justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3 text-[13px]">
                <span className="text-[#A0A5B1]">You are watching</span>
                <span className="font-bold text-white bg-white/10 px-2 py-1 rounded">Episode {activeEp}</span>
                <span className="text-[#A0A5B1] hidden sm:inline">If current server doesn't work please try other servers.</span>
              </div>
              
              {/* Autoplay Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#A0A5B1] font-medium">Auto Play</span>
                <button 
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isAutoplay ? 'bg-primary' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-black transition-transform ${isAutoplay ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
            
            {/* Server Buttons */}
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4 w-full md:w-[120px] flex-shrink-0">
                  <div className="flex flex-col items-center justify-center w-full bg-surface-hover rounded-lg py-3 border border-white/5">
                    <span className="text-[11px] text-[#A0A5B1] font-bold uppercase tracking-wider mb-2">Servers</span>
                    <div className="flex gap-2">
                      <span className="bg-sub text-black px-1.5 py-0.5 rounded-[3px] text-[10px] font-extrabold">SUB</span>
                      <span className="bg-dub text-black px-1.5 py-0.5 rounded-[3px] text-[10px] font-extrabold">DUB</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[12px] font-bold text-[#A0A5B1] w-12">SUB:</span>
                    {servers.map(server => (
                      <button 
                        key={`sub-${server}`}
                        onClick={() => { setServerType('sub'); setActiveServer(server); }}
                        className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                          serverType === 'sub' && activeServer === server 
                            ? 'bg-primary text-black' 
                            : 'bg-surface-hover text-[#A0A5B1] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {server}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[12px] font-bold text-[#A0A5B1] w-12">DUB:</span>
                    {servers.map(server => (
                      <button 
                        key={`dub-${server}`}
                        onClick={() => { setServerType('dub'); setActiveServer(server); }}
                        className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                          serverType === 'dub' && activeServer === server 
                            ? 'bg-primary text-black' 
                            : 'bg-surface-hover text-[#A0A5B1] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {server}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Details */}
          <div className="bg-surface rounded-xl p-6 border border-white/5 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">{episodeTitle}</h2>
            <div className="text-[12px] text-[#A0A5B1] mb-4 flex items-center gap-2">
              <span>Released: {formattedDate}</span>
            </div>
            <p className="text-[14px] text-[#A0A5B1] leading-relaxed">
              {episodeSynopsis}
            </p>
          </div>

          {/* Recommended for You */}
          <div className="bg-surface rounded-xl p-6 border border-white/5 shadow-lg">
            <h2 className="text-[20px] font-bold text-white mb-4">Recommended for You</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 md:mx-0 md:px-0">
              {recommendedAnime.map((recommended) => (
                <div key={recommended.id} className="min-w-[140px] md:min-w-[180px] lg:min-w-[200px] flex-shrink-0">
                  <AnimeCard anime={recommended} />
                </div>
              ))}
            </div>
          </div>

          {/* User Rating */}
          <div className="bg-surface rounded-xl p-6 border border-white/5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
              <h2 className="text-[20px] font-bold text-white">Rate this anime</h2>
              <p className="text-[13px] text-[#A0A5B1]">What did you think about {anime.title}?</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setUserRating(star)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={36} 
                      className={`transition-colors duration-200 ${(hoveredStar !== null ? star <= hoveredStar : userRating !== null && star <= userRating) ? 'fill-primary text-primary drop-shadow-[0_0_10px_rgba(255,185,19,0.5)]' : 'text-[#A0A5B1] hover:text-white'}`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-[13px] text-[#A0A5B1]">
                {userRating ? (
                  <span>You rated it <span className="text-white font-bold">{userRating}</span> stars! Thanks for voting.</span>
                ) : (
                  <span>Average Rating: <span className="text-white font-bold text-[15px]">4.8</span> / 5 (<span className="text-white">12,453</span> votes)</span>
                )}
              </div>
            </div>
          </div>

          {/* Anime Details */}
          <div className="flex flex-col md:flex-row gap-6 bg-surface rounded-xl p-6 border border-white/5 shadow-lg">
            <div className="w-32 md:w-48 flex-shrink-0 mx-auto md:mx-0">
              <img src={anime.image} alt={anime.title} className="w-full rounded-lg shadow-xl object-cover aspect-[2/3]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-3">{anime.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[12px] mb-5">
                <span className="bg-white text-black px-2 py-0.5 rounded-[3px] font-bold">{anime.rating}</span>
                <span className="bg-primary text-black px-2 py-0.5 rounded-[3px] font-bold">{anime.quality}</span>
                <span className="bg-sub text-black px-2 py-0.5 rounded-[3px] font-bold flex items-center gap-1">CC {anime.sub}</span>
                <span className="bg-dub text-black px-2 py-0.5 rounded-[3px] font-bold flex items-center gap-1">MIC {anime.dub}</span>
                <span className="text-[#A0A5B1] flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#A0A5B1]"></span> {anime.type}</span>
                <span className="text-[#A0A5B1] flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#A0A5B1]"></span> {anime.duration}</span>
              </div>
              <p className="text-[#A0A5B1] text-[14px] leading-relaxed mb-6">
                {anime.description}
              </p>
              <div className="bg-surface-hover p-4 rounded-lg border border-white/5">
                <p className="text-[13px] text-[#A0A5B1]">
                  AniWatch is the best site to watch <span className="font-bold text-white">{anime.title}</span> SUB online, or you can even watch <span className="font-bold text-white">{anime.title}</span> DUB in HD quality. You can also find {anime.japaneseTitle && <span className="italic text-white">{anime.japaneseTitle}</span>} anime on AniWatch website.
                </p>
              </div>
            </div>
          </div>

          {/* Cast & Voice Actors */}
          <div className="bg-surface rounded-xl p-6 border border-white/5 shadow-lg">
            <h2 className="text-[20px] font-bold text-white mb-6">Cast & Voice Actors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cast.map((member, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[#111216] p-3 rounded-lg border border-white/5">
                  <img src={member.image} alt={member.character} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-white">{member.character}</span>
                    <span className="text-[11px] text-[#A0A5B1]">{member.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Episode List */}
        <div className="w-full xl:w-[320px] flex-shrink-0 bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col h-[600px] xl:h-auto shadow-lg">
          <div className="p-4 border-b border-white/5 bg-[#111216]">
            <h3 className="font-bold text-white mb-3 flex items-center justify-between">
              List of Episodes
              <span className="text-[11px] font-normal text-[#A0A5B1] bg-surface px-2 py-1 rounded">Total: {anime.episodes}</span>
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Episode Number..." 
                className="w-full bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-md px-3 py-2.5 text-[13px] text-white placeholder-[#A0A5B1] outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide bg-[#0B0C10]/30">
            <div className="grid grid-cols-5 gap-2">
              {episodes.map(ep => (
                <button
                  key={ep}
                  onClick={() => setActiveEp(ep)}
                  className={`py-2.5 text-[13px] font-medium rounded transition-all ${
                    activeEp === ep 
                      ? 'bg-primary text-black shadow-[0_0_10px_rgba(255,185,19,0.3)]' 
                      : 'bg-surface-hover text-[#A0A5B1] hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
