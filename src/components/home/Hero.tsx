import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronRight, ChevronLeft, Calendar, Clock, Star } from 'lucide-react';
import { fetchHeroAnime } from '../../services/jikanApi';
import { Anime } from '../../types';

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroAnime, setHeroAnime] = useState<Anime[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchHeroAnime().then(data => {
      if (mounted) setHeroAnime(data);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (heroAnime.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroAnime.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroAnime.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % heroAnime.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + heroAnime.length) % heroAnime.length);

  if (heroAnime.length === 0) {
    return <div className="w-full h-[60vh] md:h-[80vh] min-h-[500px] bg-background animate-pulse"></div>;
  }

  const current = heroAnime[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] min-h-[500px] bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${current.banner || current.image})` }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1600px] w-full mx-auto px-4 md:px-6 pt-20">
              <div className="max-w-[500px]">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-[11px] uppercase tracking-[2px] text-primary font-bold mb-3"
                >
                  Season 2 Now Streaming
                </motion.div>

                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[40px] md:text-[56px] font-black mb-5 leading-[1.1] line-clamp-2"
                >
                  {current.title}
                </motion.h1>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-[15px] text-[14px] text-[#A0A5B1] mb-6"
                >
                  <span>{current.releaseDate.split(', ')[1] || '2024'}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white">{current.type}</span>
                  <span>{current.duration}</span>
                  <span>Action, Fantasy</span>
                </motion.div>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#A0A5B1] text-[15px] leading-[1.6] line-clamp-3 mb-[30px]"
                >
                  {current.description}
                </motion.p>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-[15px]"
                >
                  <Link to={`/watch/${current.id}`} className="bg-primary hover:bg-primary-hover text-black font-bold py-3.5 px-8 rounded-[30px] flex items-center gap-2 transition-transform hover:scale-105 text-[14px]">
                    <Play size={20} fill="currentColor" />
                    Watch Now
                  </Link>
                  <button className="bg-[rgba(255,255,255,0.05)] hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-8 rounded-[30px] flex items-center gap-2 transition-colors text-[14px]">
                    + Watchlist
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-4 md:right-8 flex items-center gap-2 z-20">
        <button 
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-surface/50 hover:bg-primary hover:text-black backdrop-blur flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-surface/50 hover:bg-primary hover:text-black backdrop-blur flex items-center justify-center transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-4 md:left-6 flex items-center gap-2 z-20">
        {heroAnime.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
