import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fetchTrendingAnime } from '../../services/jikanApi';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

export default function Trending() {
  const [sortBy, setSortBy] = useState('Most Popular');
  const [isLoading, setIsLoading] = useState(true);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchTrendingAnime();
      if (mounted) {
        setTrendingAnime(data);
        setIsLoading(false);
      }
    };
    
    loadData();
    return () => { mounted = false; };
  }, []);

  const sortAnime = (animeList: Anime[], sortType: string) => {
    const list = [...animeList];
    switch (sortType) {
      case 'Newest':
        return list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      case 'Oldest':
        return list.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      case 'Most Popular':
        return list.sort((a, b) => b.sub - a.sub);
      case 'Alphabetical':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  };

  const sortedAnime = sortAnime(trendingAnime, sortBy);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Trending Now</h2>
        <div className="flex items-center gap-4">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[rgba(255,255,255,0.05)] border border-white/10 text-[#A0A5B1] text-[13px] rounded px-2 py-1.5 outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="Newest" className="bg-surface text-white">Newest</option>
            <option value="Oldest" className="bg-surface text-white">Oldest</option>
            <option value="Most Popular" className="bg-surface text-white">Most Popular</option>
            <option value="Alphabetical" className="bg-surface text-white">Alphabetical</option>
          </select>
          <button className="text-[13px] font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            View All <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="min-w-[140px] md:min-w-[180px] lg:min-w-[200px] flex-shrink-0">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface/50 animate-pulse border border-white/5">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-white/5" />
                
                {/* Badge Placeholder */}
                <div className="absolute top-2.5 left-2.5 w-12 h-4 bg-white/10 rounded-[3px]" />

                {/* Info Overlay Placeholder */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2">
                  <div className="w-3/4 h-3 bg-white/10 rounded" />
                  <div className="w-1/2 h-2.5 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : (
          sortedAnime.map((anime, idx) => (
            <div key={anime.id} className="min-w-[140px] md:min-w-[180px] lg:min-w-[200px] flex-shrink-0">
              <Link to={`/watch/${anime.id}`} className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface group cursor-pointer block">
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Episode Badge */}
                <div className="absolute top-2.5 left-2.5 bg-primary text-black px-1.5 py-0.5 rounded-[3px] text-[10px] font-extrabold z-10 shadow-md">
                  EP {anime.episodes}
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-10">
                  <h3 className="font-semibold text-[13px] text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {anime.title}
                  </h3>
                  <p className="text-[#A0A5B1] text-[11px] mt-1">
                    {anime.type} • {anime.duration}
                  </p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
