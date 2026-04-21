import React from 'react';
import Hero from '../components/home/Hero';
import Trending from '../components/home/Trending';
import AnimeGrid from '../components/home/AnimeGrid';
import TopTenSidebar from '../components/home/TopTenSidebar';

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <Trending />
        
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <AnimeGrid />
          <TopTenSidebar />
        </div>
      </div>
    </main>
  );
}
