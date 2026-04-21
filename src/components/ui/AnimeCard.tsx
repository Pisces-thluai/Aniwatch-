import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Anime } from '../../types';

interface AnimeCardProps {
  anime: Anime;
  key?: React.Key;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link to={`/watch/${anime.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-surface cursor-pointer block">
      <img 
        src={anime.image} 
        alt={anime.title} 
        className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
        <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
      </div>

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
  );
}
