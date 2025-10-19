import React, { useState, useEffect } from 'react';
import { AdItem } from '../services/geminiService';
import { MegaphoneIcon } from './Icons';

interface RollingAdBannerProps {
  adItems: AdItem[];
}

const RollingAdBanner: React.FC<RollingAdBannerProps> = ({ adItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (adItems.length <= 1) {
        return;
    }

    const intervalId = setInterval(() => {
      setIsVisible(false); // Start fade-out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % adItems.length);
        setIsVisible(true); // Start fade-in with new content
      }, 500); // This must match the CSS transition duration
    }, 5000); // Change ad every 5 seconds

    return () => clearInterval(intervalId);
  }, [adItems.length]);

  if (adItems.length === 0) {
    return null; // Don't render anything if there are no ads
  }

  const currentAd = adItems[currentIndex];

  return (
    <a 
      href={currentAd.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-gradient-to-r from-sky-100 to-indigo-100 border border-slate-200 rounded-lg p-3 sm:p-4 text-slate-800 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 bg-white/70 p-2 rounded-full">
            <MegaphoneIcon className="w-6 h-6 text-indigo-500" />
        </div>
        <div className="flex-grow text-left overflow-hidden">
             <div 
                className={`transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
             >
                <p className="font-semibold text-sm sm:text-base truncate">{currentAd.text}</p>
                <p className="text-xs sm:text-sm text-slate-500">자세히 보기 &rarr;</p>
            </div>
        </div>
      </div>
    </a>
  );
};

export default RollingAdBanner;