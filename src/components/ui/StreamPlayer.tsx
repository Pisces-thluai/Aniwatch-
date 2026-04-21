import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  url: string;
  poster?: string;
  subtitles?: { url: string; lang: string }[];
}

export default function StreamPlayer({ url, poster, subtitles }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported() && url.includes('.m3u8')) {
      hls = new Hls({
        debug: false,
        enableWorker: true,
      });
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error encountered while loading video.');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media parsing error encountered.');
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setError('Unrecoverable video error.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = url;
    } else {
      video.src = url;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-white p-4 text-center rounded-xl overflow-hidden border border-white/5">
        <div>
          <p className="text-red-500 mb-2">Failed to load video stream</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black relative rounded-xl overflow-hidden border border-white/5 shadow-xl group">
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full"
        crossOrigin="anonymous"
      >
        {subtitles?.map((sub, i) => (
          <track
            key={i}
            kind="captions"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.lang}
            default={sub.lang.toLowerCase() === 'english'}
          />
        ))}
      </video>
    </div>
  );
}
