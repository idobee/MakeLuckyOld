import React, { useState, useEffect } from 'react';
import { LuckInput } from './components/LuckInput';
import { ResultDisplay } from './components/ResultDisplay';
import { AdviceCoach } from './components/AdviceCoach';
import { WeeklyReport } from './components/WeeklyReport';
import { MonthlyReport } from './components/MonthlyReport';
import { useSwipeable } from 'react-swipeable';
import { GeminiHelper } from './components/GeminiHelper';
import GoogleAd from './components/GoogleAd';
import RollingAdBanner from './components/RollingAdBanner';
import FeedbackWidget from './components/FeedbackWidget';
import { Icons } from './components/Icons';
import { DailyLuck, LuckHistory } from './types';
import { generateDetailedAdvice } from './services/localAdviceService';
import { getGeminiAdvice } from './services/geminiService';
import { submitFeedback } from './services/feedbackService';

const adItems = [
  { image: "https://via.placeholder.com/300x100.png?text=Ad+1", link: "#" },
  { image: "https://via.placeholder.com/300x100.png?text=Ad+2", link: "#" },
  { image: "https://via.placeholder.com/300x100.png?text=Ad+3", link: "#" }
];

function App() {
  const [date, setDate] = useState(new Date());
  const [dailyLuck, setDailyLuck] = useState<DailyLuck | null>(null);
  const [luckHistory, setLuckHistory] = useState<LuckHistory | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyLuck = async () => {
      const result = await generateDetailedAdvice(luckHistory, 'daily');
      setDailyLuck(result);
    };
    fetchDailyLuck();
  }, []);

  const handleFeedbackSubmit = async (feedback: string) => {
    setFeedback(feedback);
    await submitFeedback(feedback);
  };

  return (
    <div className="w-full md:w-[70%]">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ... */}
      </main>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-[30%]">
            <RollingAdBanner adItems={adItems} />
          </div>
          <div className="w-full md:w-[70%]">
            <GoogleAd 
              client={import.meta.env.VITE_ADSENSE_CLIENT_ID} 
              slot={import.meta.env.VITE_ADSENSE_SLOT_ID} 
            />
          </div>
        </div>
      </div>
      <footer className="text-center py-6 text-slate-500 text-sm">
        {/* ... */}
      </footer>
      <FeedbackWidget onSubmit={handleFeedbackSubmit} />
    </div>
  );
}

export default App;