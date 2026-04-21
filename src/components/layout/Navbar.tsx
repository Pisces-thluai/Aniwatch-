import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, User, Bell, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchAnime } from '../../services/jikanApi';
import { Anime } from '../../types';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        const results = await searchAnime(searchQuery);
        setFilteredAnime(results);
        setIsSearching(false);
      } else {
        setFilteredAnime([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 md:gap-8">
          <button className="p-2 hover:bg-surface rounded-full transition-colors md:hidden">
            <Menu size={24} />
          </button>
          
          <a href="/" className="flex items-center gap-1 text-2xl font-black tracking-tighter">
            <span className="text-white">Ani</span>
            <span className="text-primary">Watch</span>
          </a>

          <div className="hidden lg:flex items-center gap-[30px] text-[14px] font-medium text-[#A0A5B1]">
            <a href="#" className="text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Movies</a>
            <a href="#" className="hover:text-white transition-colors">TV Series</a>
            <a href="#" className="hover:text-white transition-colors">Most Popular</a>
            <a href="#" className="hover:text-white transition-colors">Top Airing</a>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 relative">
          <div className="hidden md:flex relative group">
            <div className="flex items-center bg-[rgba(255,255,255,0.05)] focus-within:bg-[rgba(255,255,255,0.1)] transition-colors rounded-[20px] px-4 py-2 w-64 lg:w-[280px] border border-white/10 focus-within:border-primary/50">
              <input 
                type="text" 
                placeholder="Search anime..." 
                className="bg-transparent border-none outline-none text-[13px] w-full text-white placeholder-[#A0A5B1]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredAnime.length > 0) {
                    navigate(`/watch/${filteredAnime[0].id}`);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }
                }}
              />
              <Search size={18} className="text-[#A0A5B1]" />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.length > 0 && (
              <div className="absolute top-full lg:top-[calc(100%+8px)] right-0 left-0 bg-[#111216] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 mt-2 py-2">
                {isSearching ? (
                  <div className="px-4 py-6 text-center text-[#A0A5B1] text-[13px] animate-pulse">
                    Searching...
                  </div>
                ) : filteredAnime.length > 0 ? (
                  filteredAnime.map(anime => (
                    <Link 
                      key={anime.id}
                      to={`/watch/${anime.id}`}
                      onMouseDown={(e) => e.preventDefault()} // Prevents input blur before click
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                        <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[13px] font-bold text-white line-clamp-1">{anime.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#A0A5B1] font-medium mt-1">
                          <span className="bg-white/10 px-1.5 rounded text-[10px]">{anime.type}</span>
                          <span>{anime.duration}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-[#A0A5B1] text-[13px]">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className="md:hidden p-2 hover:bg-surface rounded-full transition-colors">
            <Search size={20} />
          </button>

          <button className="p-2 hover:bg-surface rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
