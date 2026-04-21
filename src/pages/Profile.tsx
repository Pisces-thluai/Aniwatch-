import React, { useState } from 'react';
import { User, Mail, Calendar, Edit2, Settings, Clock, Heart, Camera } from 'lucide-react';
import AnimeCard from '../components/ui/AnimeCard';
import { trendingAnime, recentlyUpdated } from '../data/mock';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'Leon Nova',
    email: 'leonnova321@gmail.com',
    bio: 'Anime enthusiast. Always looking for the next great Isekai or Shonen!',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <main className="flex-1 pt-20 pb-12 max-w-[1600px] mx-auto px-4 md:px-6 w-full">
      {/* Banner & Avatar */}
      <div className="relative rounded-xl overflow-hidden mb-16 shadow-lg border border-white/5">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 bg-surface"></div>
        <div className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-lg cursor-pointer hover:bg-black/80 transition-colors backdrop-blur">
          <Camera size={20} className="text-white" />
        </div>
        
        <div className="absolute -bottom-12 left-6 md:left-10 flex items-end gap-6">
          <div className="relative group cursor-pointer z-10">
            <img src="https://ui-avatars.com/api/?name=Leon+Nova&background=ffb913&color=000&size=128" alt="Avatar" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background object-cover bg-surface shadow-xl" />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <div className="mb-2 hidden sm:block">
            <h1 className="text-2xl font-black text-white">{profileData.username}</h1>
            <p className="text-[#A0A5B1] text-sm">Member since April 2026</p>
          </div>
        </div>
      </div>

      <div className="sm:hidden mb-8 px-2">
        <h1 className="text-2xl font-black text-white">{profileData.username}</h1>
        <p className="text-[#A0A5B1] text-sm">Member since April 2026</p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 border border-white/5 bg-surface rounded-xl p-4 self-start shadow-lg">
          <nav className="flex flex-col gap-2">
             <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-[#A0A5B1] hover:bg-white/5 hover:text-white'}`}>
               <User size={18} /> Profile Settings
             </button>
             <button onClick={() => setActiveTab('watchlist')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === 'watchlist' ? 'bg-primary/10 text-primary' : 'text-[#A0A5B1] hover:bg-white/5 hover:text-white'}`}>
               <Heart size={18} /> Watchlist
             </button>
             <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${activeTab === 'history' ? 'bg-primary/10 text-primary' : 'text-[#A0A5B1] hover:bg-white/5 hover:text-white'}`}>
               <Clock size={18} /> Watch History
             </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'settings' && (
            <div className="bg-surface border border-white/5 rounded-xl p-6 md:p-8 shadow-lg min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors bg-white/5 px-4 py-2 rounded-lg"
                >
                  {isEditing ? 'Cancel Edit' : <><Edit2 size={16} /> Edit Profile</>}
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-[#A0A5B1] mb-2 pl-1">Username</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="w-full bg-[#111216] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary disabled:opacity-60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A5B1] mb-2 pl-1">Email Address</label>
                  <input 
                    type="email"
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-[#111216] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary disabled:opacity-60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A0A5B1] mb-2 pl-1">Bio</label>
                  <textarea 
                    disabled={!isEditing}
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full bg-[#111216] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary disabled:opacity-60 transition-colors resize-none"
                  ></textarea>
                </div>

                {isEditing && (
                  <div className="flex justify-start pt-4">
                    <button type="submit" className="bg-primary text-black font-bold px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors">
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="bg-surface border border-white/5 rounded-xl p-6 md:p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">My Watchlist</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingAnime.map(anime => (
                  <AnimeCard key={`watchlist-${anime.id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-surface border border-white/5 rounded-xl p-6 md:p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Watch History</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyUpdated.map(anime => (
                  <AnimeCard key={`history-${anime.id}`} anime={anime} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
