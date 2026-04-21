import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface mt-16 py-12 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <a href="/" className="flex items-center gap-1 text-3xl font-black tracking-tighter">
            <span className="text-white">Ani</span>
            <span className="text-primary">Watch</span>
          </a>
          
          <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Terms of service</a>
            <a href="#" className="hover:text-primary transition-colors">DMCA</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 max-w-3xl">
          <p className="mb-2">
            AniWatch does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
          </p>
          <p>
            © {new Date().getFullYear()} AniWatch Clone. All rights reserved. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
