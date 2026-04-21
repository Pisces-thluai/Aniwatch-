import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { fetchRecentlyUpdated } from '../../services/jikanApi';
import AnimeCard from '../ui/AnimeCard';
import { Anime } from '../../types';

export default function AnimeGrid() {
  const [sortBy, setSortBy] = useState('Newest');
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Anime[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchRecentlyUpdated();
      if (mounted) {
        setRecentlyUpdated(data);
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

  const sortedAnime = sortAnime(recentlyUpdated, sortBy);

  return (
    <section className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Recently Updated</h2>
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface/50 animate-pulse border border-white/5">
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
          ))
        ) : (
          sortedAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))
        )}
      </div>
    </section>
  );
}
