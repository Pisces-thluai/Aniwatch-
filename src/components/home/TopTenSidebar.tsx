import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTopTenAnime } from '../../services/jikanApi';
import { Anime } from '../../types';

export default function TopTenSidebar() {
  const [activeTab, setActiveTab] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [topTenAnime, setTopTenAnime] = useState<Anime[]>([]);
  const tabs: ('Day' | 'Week' | 'Month')[] = ['Day', 'Week', 'Month'];

  useEffect(() => {
    let mounted = true;
    fetchTopTenAnime().then(data => {
      if (mounted) setTopTenAnime(data);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0">
      <h2 className="text-[20px] font-bold text-white mb-6">Top 10</h2>
      
      <div className="bg-[#0B0C10]/80 backdrop-blur-[10px] border border-white/5 rounded-xl p-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-[rgba(255,255,255,0.1)] text-white' 
                  : 'text-[#A0A5B1] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {topTenAnime.length === 0 ? (
            Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 mb-2 animate-pulse">
                <div className="w-8" />
                <div className="w-[45px] h-[60px] bg-white/10 rounded" />
                <div className="flex flex-col gap-2 flex-1 pt-2">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            ))
          ) : (
            topTenAnime.slice(0, 10).map((anime, idx) => {
              return (
                <Link to={`/watch/${anime.id}`} key={anime.id} className="flex items-center gap-3 group cursor-pointer mb-2 block">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center font-extrabold text-[20px] text-[#A0A5B1] opacity-30">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex gap-3 flex-1 overflow-hidden">
                    <div className="w-[45px] h-[60px] bg-[#23252b] rounded flex-shrink-0 overflow-hidden">
                      <img 
                        src={anime.image} 
                        alt={anime.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h4 className="font-medium text-[12px] line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {anime.title}
                      </h4>
                      <p className="text-[10px] text-[#A0A5B1]">
                        EP {anime.episodes} / {anime.type}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
